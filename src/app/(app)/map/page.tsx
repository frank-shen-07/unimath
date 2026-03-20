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
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_TOPICS,
  DEFAULT_EDGES,
  CATEGORY_COLORS,
  CATEGORY_CENTERS,
} from "@/lib/topics";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Dumbbell, X, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import type { TopicNode } from "@/lib/types";

interface TopicNodeData {
  label: string;
  category: string;
  practiceCount: number;
  masteryScore: number;
  heatColor: string;
  glowColor: string;
  [key: string]: unknown;
}

interface SimulationNode extends SimulationNodeDatum {
  id: string;
  category: string;
  x: number;
  y: number;
}

function TopicNodeComponent({ data }: { data: TopicNodeData }) {
  const practiced = data.practiceCount > 0;
  const colors =
    CATEGORY_COLORS[data.category] ?? CATEGORY_COLORS["Basic Calculus"];

  return (
    <div
      className="min-w-[170px] rounded-2xl border px-4 py-3 text-left shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: practiced
          ? `linear-gradient(180deg, rgba(15,23,42,0.96), ${data.heatColor}22)`
          : "rgba(15,23,42,0.88)",
        borderColor: practiced ? `${data.heatColor}aa` : "rgba(148,163,184,0.16)",
        boxShadow: practiced
          ? `0 10px 24px rgba(2,6,23,0.42), 0 0 0 1px ${data.heatColor}22, 0 0 22px ${data.glowColor}25`
          : "0 10px 24px rgba(2,6,23,0.35)",
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-primary/80" />
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${colors.bg} ${colors.border} ${colors.text}`}
        >
          {data.category}
        </span>
        {practiced && (
          <span className="text-[10px] font-medium text-emerald-300">
            {data.practiceCount} solved
          </span>
        )}
      </div>
      <p className="text-sm font-semibold leading-5 text-slate-100">
        {data.label}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.max(8, Math.min(100, (data.practiceCount / 200) * 100))}%`,
            background: practiced ? data.heatColor : "rgba(100,116,139,0.35)",
          }}
        />
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-primary/80" />
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

  const buildGraph = useCallback((topics: TopicNode[]) => {
    const topicMap = new globalThis.Map(topics.map((t) => [t.topic_name, t]));
    const simulationNodes: SimulationNode[] = DEFAULT_TOPICS.map((topic) => ({
      id: topic.id,
      category: topic.category,
      x: topic.x,
      y: topic.y,
    }));

    const simulationLinks = DEFAULT_EDGES.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    const simulation = forceSimulation(simulationNodes)
      .force(
        "link",
        forceLink(simulationLinks)
          .id((node) => (node as SimulationNode).id)
          .distance(110)
          .strength(0.2)
      )
      .force("charge", forceManyBody().strength(-230))
      .force("collide", forceCollide(82))
      .force(
        "x",
        forceX((node: SimulationNode) => CATEGORY_CENTERS[node.category]?.x ?? 0).strength(0.18)
      )
      .force(
        "y",
        forceY((node: SimulationNode) => CATEGORY_CENTERS[node.category]?.y ?? 0).strength(0.18)
      )
      .force("center", forceCenter(40, 80))
      .stop();

    for (let i = 0; i < 220; i += 1) {
      simulation.tick();
    }

    const positioned = new globalThis.Map(
      simulationNodes.map((node) => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }])
    );

    const flowNodes: Node[] = DEFAULT_TOPICS.map((t) => {
      const userData = topicMap.get(t.name);
      const position = positioned.get(t.id) ?? { x: t.x, y: t.y };
      const practiceCount = userData?.practice_count || 0;
      const { heatColor, glowColor } = getPracticeHeat(practiceCount);

      return {
        id: t.id,
        type: "topicNode",
        position,
        draggable: true,
        data: {
          label: t.name,
          category: t.category,
          practiceCount,
          masteryScore: userData?.mastery_score || 0,
          heatColor,
          glowColor,
        },
      };
    });

    const flowEdges: Edge[] = DEFAULT_EDGES.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      animated: false,
      style: {
        stroke: e.label === "bridge" ? "rgba(148,163,184,0.28)" : "rgba(99,102,241,0.22)",
        strokeWidth: e.label === "bridge" ? 1 : 1.4,
        strokeDasharray: e.label === "bridge" ? "4 5" : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
        color: e.label === "bridge" ? "rgba(148,163,184,0.28)" : "rgba(99,102,241,0.22)",
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [setEdges, setNodes]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("topic_nodes")
          .select("*")
          .eq("user_id", user.id);
        if (data) {
          setUserTopics(data);
          buildGraph(data);
          return;
        }
      }
      buildGraph([]);
    };
    load();
  }, [buildGraph]);

  useEffect(() => {
    buildGraph(userTopics);
  }, [buildGraph, userTopics]);

  const onNodeClick = useCallback<NodeMouseHandler>((_, node) => {
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
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(categoryStats).map(([cat, s]) => (
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
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
        >
          <Background gap={18} size={1} color="rgba(99,102,241,0.12)" />
          <Controls className="!rounded-xl !border-border/50 !shadow-lg" />
          <MiniMap
            className="!rounded-xl !border-border/50 !shadow-lg"
            maskColor="var(--background)"
            nodeColor={(node) => ((node.data as TopicNodeData | undefined)?.heatColor ?? "rgba(71,85,105,0.7)")}
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
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        Start here to light up this node.
                      </p>
                    </div>
                  )}
                  <Link href={`/practice?topic=${encodeURIComponent(selectedTopic.name)}`}>
                    <Button className="w-full rounded-xl" size="sm">
                      <Dumbbell className="w-4 h-4 mr-2" /> Practice This Topic
                    </Button>
                  </Link>
                  <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Practice heat guide
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[10, 50, 100, 200].map((count) => {
                        const heat = getPracticeHeat(count);
                        return (
                          <span
                            key={count}
                            className="rounded-full px-2 py-1"
                            style={{
                              backgroundColor: `${heat.heatColor}22`,
                              border: `1px solid ${heat.heatColor}88`,
                              color: heat.heatColor,
                            }}
                          >
                            {count}+
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getPracticeHeat(practiceCount: number) {
  if (practiceCount >= 200) {
    return { heatColor: "#39d353", glowColor: "#39d353" };
  }
  if (practiceCount >= 100) {
    return { heatColor: "#2ea043", glowColor: "#2ea043" };
  }
  if (practiceCount >= 50) {
    return { heatColor: "#26a641", glowColor: "#26a641" };
  }
  if (practiceCount >= 10) {
    return { heatColor: "#3fb950", glowColor: "#3fb950" };
  }
  if (practiceCount > 0) {
    return { heatColor: "#1f6f43", glowColor: "#1f6f43" };
  }
  return { heatColor: "#475569", glowColor: "#475569" };
}
