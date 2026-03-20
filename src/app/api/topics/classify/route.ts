import { classifyTopic } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, isCorrect } = await request.json();

    if (!question) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }

    const topicName = await classifyTopic(question);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: existing } = await supabase
        .from("topic_nodes")
        .select("*")
        .eq("user_id", user.id)
        .eq("topic_name", topicName)
        .single();

      if (existing) {
        const newCount = existing.practice_count + 1;
        const correctDelta = isCorrect ? 1 : 0;
        const currentCorrect = (existing.mastery_score / 100) * existing.practice_count;
        const newMastery = ((currentCorrect + correctDelta) / newCount) * 100;

        await supabase
          .from("topic_nodes")
          .update({
            practice_count: newCount,
            mastery_score: Math.round(newMastery * 10) / 10,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("topic_nodes").insert({
          user_id: user.id,
          topic_name: topicName,
          category: getCategoryForTopic(topicName),
          practice_count: 1,
          mastery_score: isCorrect ? 100 : 0,
          position_x: 0,
          position_y: 0,
        });
      }
    }

    return Response.json({ topic: topicName });
  } catch (error) {
    console.error("Topic classify error:", error);
    return Response.json(
      { error: "Failed to classify topic" },
      { status: 500 }
    );
  }
}

function getCategoryForTopic(topic: string): string {
  const categoryMap: Record<string, string[]> = {
    Foundations: ["Sets and Functions", "Logic and Proofs", "Number Theory"],
    Calculus: ["Limits", "Derivatives", "Integration", "Multivariable Calculus", "Series and Sequences"],
    "Linear Algebra": ["Vectors", "Matrices", "Eigenvalues and Eigenvectors", "Linear Transformations", "Vector Spaces"],
    "Differential Equations": ["First-Order ODEs", "Second-Order ODEs", "Laplace Transforms", "Partial Differential Equations"],
    "Probability & Statistics": ["Probability", "Statistics", "Combinatorics"],
    "Discrete Math": ["Graph Theory"],
    Advanced: ["Real Analysis", "Complex Analysis", "Abstract Algebra", "Topology", "Numerical Methods", "Optimization", "Fourier Analysis"],
  };

  for (const [category, topics] of Object.entries(categoryMap)) {
    if (topics.includes(topic)) return category;
  }
  return "Foundations";
}
