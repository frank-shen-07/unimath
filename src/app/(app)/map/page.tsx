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

const HEAT_TIERS = [
  { label: "1-9", color: "#29543a", bg: "rgba(41,84,58,0.22)" },
  { label: "10+", color: "#2f8f4e", bg: "rgba(47,143,78,0.18)" },
  { label: "50+", color: "#53c26b", bg: "rgba(83,194,107,0.18)" },
  { label: "100+", color: "#97ea59", bg: "rgba(151,234,89,0.18)" },
  { label: "200+", color: "#d7ff6f", bg: "rgba(215,255,111,0.2)" },
] as const;

function TopicNodeComponent({ data }: { data: TopicNodeData }) {
  const practiced = data.practiceCount > 0;
  const colors =
    CATEGORY_COLORS[data.category] ?? CATEGORY_COLORS["Basic Calculus"];

  return (
    <div
      className="relative flex h-[156px] w-[156px] items-center justify-center rounded-full border text-center shadow-lg transition-all duration-200 hover:-translate-y-1"
      style={{
        background: practiced
          ? `radial-gradient(circle at 50% 35%, rgba(255,255,255,0.05), transparent 48%), linear-gradient(180deg, rgba(11,15,18,0.98), ${data.heatColor}20)`
          : "linear-gradient(180deg, rgba(11,15,18,0.98), rgba(15,23,42,0.9))",
        borderColor: practiced ? `${data.heatColor}cc` : "rgba(148,163,184,0.18)",
        boxShadow: practiced
          ? `0 16px 34px rgba(2,6,23,0.46), 0 0 0 2px ${data.heatColor}22, 0 0 28px ${data.glowColor}28`
          : "0 14px 32px rgba(2,6,23,0.38)",
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-0 !bg-primary/80" />
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-5 py-5">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${colors.bg} ${colors.border} ${colors.text}`}
        >
          {data.category}
        </span>
        <p className="line-clamp-3 text-sm font-semibold leading-5 text-slate-100">
          {data.label}
        </p>
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-[11px] font-medium"
            style={{ color: practiced ? data.heatColor : "rgba(148,163,184,0.72)" }}
          >
            {practiced ? `${data.practiceCount} solved` : "Not practiced"}
          </span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(10, Math.min(100, (data.practiceCount / 200) * 100))}%`,
                background: practiced ? data.heatColor : "rgba(100,116,139,0.35)",
              }}
            />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-0 !bg-primary/80" />
    </div>
  );
}

function PracticeHeatLegend() {
  return (
    <Card className="w-64 border-border/50 bg-background/92 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Practice heat guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {HEAT_TIERS.map((tier) => (
          <div
            key={tier.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/20 px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  backgroundColor: tier.bg,
                  borderColor: tier.color,
                  boxShadow: `0 0 0 1px ${tier.color}22, 0 0 12px ${tier.color}22`,
                }}
              />
              <span className="text-sm font-medium text-foreground">{tier.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">questions</span>
          </div>
        ))}
        <p className="text-xs leading-5 text-muted-foreground">
          Higher practice counts use brighter rings and fills so strong topics stand out at a glance.
        </p>
      </CardContent>
    </Card>
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
          .distance(175)
          .strength(0.14)
      )
      .force("charge", forceManyBody().strength(-520))
      .force("collide", forceCollide(110))
      .force(
        "x",
        forceX((node: SimulationNode) => (CATEGORY_CENTERS[node.category]?.x ?? 0) * 1.35).strength(0.14)
      )
      .force(
        "y",
        forceY((node: SimulationNode) => (CATEGORY_CENTERS[node.category]?.y ?? 0) * 1.35).strength(0.14)
      )
      .force("center", forceCenter(70, 100))
      .stop();

    for (let i = 0; i < 320; i += 1) {
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
          fitViewOptions={{ padding: 0.24 }}
          minZoom={0.22}
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

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-4 top-4 z-10"
        >
          <PracticeHeatLegend />
        </motion.div>

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
    return { heatColor: "#d7ff6f", glowColor: "#d7ff6f" };
  }
  if (practiceCount >= 100) {
    return { heatColor: "#97ea59", glowColor: "#97ea59" };
  }
  if (practiceCount >= 50) {
    return { heatColor: "#53c26b", glowColor: "#53c26b" };
  }
  if (practiceCount >= 10) {
    return { heatColor: "#2f8f4e", glowColor: "#2f8f4e" };
  }
  if (practiceCount > 0) {
    return { heatColor: "#29543a", glowColor: "#29543a" };
  }
  return { heatColor: "#475569", glowColor: "#475569" };
}
