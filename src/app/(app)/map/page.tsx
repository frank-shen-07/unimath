"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TOPICS, DEFAULT_EDGES, CATEGORY_COLORS } from "@/lib/topics";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Dumbbell, X, Target } from "lucide-react";
import Link from "next/link";
import type { TopicNode } from "@/lib/types";

interface TopicNodeData {
  label: string;
  category: string;
  practiceCount: number;
  masteryScore: number;
  [key: string]: unknown;
}

function TopicNodeComponent({ data }: { data: TopicNodeData }) {
  const mastery = data.masteryScore;
  const practiced = data.practiceCount > 0;
  const colors = CATEGORY_COLORS[data.category] || CATEGORY_COLORS["Foundations"];

  let ringColor = "border-muted";
  if (practiced) {
    if (mastery >= 80) ringColor = "border-emerald-500";
    else if (mastery >= 40) ringColor = "border-amber-500";
    else ringColor = "border-red-500";
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 ${practiced ? ringColor : "border-border/40"} ${practiced ? colors.bg : "bg-card/60"} shadow-sm backdrop-blur-sm min-w-[120px] text-center transition-all hover:shadow-md`}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
      <p className={`text-xs font-semibold ${practiced ? colors.text : "text-muted-foreground/60"}`}>
        {data.label}
      </p>
      {practiced && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="text-[10px] font-medium text-muted-foreground">
            {data.practiceCount} solved
          </span>
          <span className={`text-[10px] font-bold ${mastery >= 80 ? "text-emerald-500" : mastery >= 40 ? "text-amber-500" : "text-red-500"}`}>
            {Math.round(mastery)}%
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  topicNode: TopicNodeComponent,
};

export default function MapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedTopic, setSelectedTopic] = useState<{ name: string; category: string; practiceCount: number; masteryScore: number } | null>(null);
  const [userTopics, setUserTopics] = useState<TopicNode[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("topic_nodes")
          .select("*")
          .eq("user_id", user.id);
        if (data) setUserTopics(data);
      }
      buildGraph(userTopics);
    };
    load();
  }, []);

  useEffect(() => {
    buildGraph(userTopics);
  }, [userTopics]);

  const buildGraph = (topics: TopicNode[]) => {
    const topicMap = new globalThis.Map(topics.map((t) => [t.topic_name, t]));

    const flowNodes: Node[] = DEFAULT_TOPICS.map((t) => {
      const userData = topicMap.get(t.name);
      return {
        id: t.id,
        type: "topicNode",
        position: { x: t.x, y: t.y },
        data: {
          label: t.name,
          category: t.category,
          practiceCount: userData?.practice_count || 0,
          masteryScore: userData?.mastery_score || 0,
        },
      };
    });

    const flowEdges: Edge[] = DEFAULT_EDGES.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      animated: false,
      style: { stroke: "var(--border)", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: "var(--border)" },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data as TopicNodeData;
    setSelectedTopic({
      name: data.label,
      category: data.category,
      practiceCount: data.practiceCount,
      masteryScore: data.masteryScore,
    });
  }, []);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; practiced: number }> = {};
    for (const t of DEFAULT_TOPICS) {
      if (!stats[t.category]) stats[t.category] = { total: 0, practiced: 0 };
      stats[t.category].total++;
      const userData = userTopics.find((ut) => ut.topic_name === t.name);
      if (userData && userData.practice_count > 0) stats[t.category].practiced++;
    }
    return stats;
  }, [userTopics]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-primary" /> Knowledge Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your mathematical journey visualized. Practiced topics light up.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(categoryStats).slice(0, 4).map(([cat, s]) => (
            <Badge key={cat} variant="outline" className="text-xs rounded-full">
              {cat}: {s.practiced}/{s.total}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} />
          <Controls className="!rounded-xl !border-border/50 !shadow-lg" />
          <MiniMap
            className="!rounded-xl !border-border/50 !shadow-lg"
            maskColor="var(--background)"
            nodeColor={() => "var(--primary)"}
          />
        </ReactFlow>

        <AnimatePresence>
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 z-10"
            >
              <Card className="w-72 border-border/50 shadow-xl backdrop-blur-sm">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedTopic.name}</CardTitle>
                    <Badge variant="secondary" className="rounded-full text-xs mt-1">
                      {selectedTopic.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 -mt-1 -mr-1"
                    onClick={() => setSelectedTopic(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTopic.practiceCount > 0 ? (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{selectedTopic.practiceCount}</p>
                          <p className="text-xs text-muted-foreground">Practiced</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${selectedTopic.masteryScore >= 80 ? "text-emerald-500" : selectedTopic.masteryScore >= 40 ? "text-amber-500" : "text-red-500"}`}>
                            {Math.round(selectedTopic.masteryScore)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Mastery</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all ${selectedTopic.masteryScore >= 80 ? "bg-emerald-500" : selectedTopic.masteryScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${selectedTopic.masteryScore}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Not yet practiced</p>
                    </div>
                  )}
                  <Link href={`/practice?topic=${encodeURIComponent(selectedTopic.name)}`}>
                    <Button className="w-full rounded-xl" size="sm">
                      <Dumbbell className="w-4 h-4 mr-2" /> Practice This Topic
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
