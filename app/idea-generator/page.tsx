import { ChatInterface } from '@/components/feature/ChatInterface';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Idea Generator | VibeCode',
  description: 'AI-powered idea generation tool to help you brainstorm and develop new concepts with advanced AI assistance.',
};

const IDEA_GENERATOR_PROMPT = `You are an expert ideation and brainstorming assistant. Your role is to help generate creative, innovative, and practical ideas based on the user's input.

For each idea generation request, you should:

1. Ask clarifying questions to understand the user's goals, constraints, and preferences
2. Generate multiple diverse ideas covering different angles and approaches
3. Provide both short-term actionable ideas and longer-term visionary concepts
4. Include practical considerations like feasibility, resources needed, and potential challenges
5. Suggest next steps for exploring the most promising ideas

Your responses should be:
- Creative and outside-the-box yet practical
- Organized with clear headings and bullet points
- Tailored to the user's specific domain or interests
- Encouraging and inspiring while remaining realistic

Current request: [User will provide their specific area or challenge for idea generation]`;

export default function IdeaGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ChatInterface
        title="Idea Generator"
        description="Brainstorm and develop innovative ideas with AI-powered assistance"
        powerPrompt={IDEA_GENERATOR_PROMPT}
      />
    </div>
  );
}