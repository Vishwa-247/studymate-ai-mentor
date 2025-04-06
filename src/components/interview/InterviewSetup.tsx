
import { useState } from "react";
import { Briefcase, Code, Clock } from "lucide-react";
import GlassMorphism from "../ui/GlassMorphism";

interface InterviewSetupProps {
  onSubmit: (role: string, techStack: string, experience: string) => void;
  isLoading?: boolean;
}

const InterviewSetup = ({ onSubmit, isLoading = false }: InterviewSetupProps) => {
  const [role, setRole] = useState("");
  const [techStack, setTechStack] = useState("");
  const [experience, setExperience] = useState("1-3");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role.trim() && techStack.trim()) {
      onSubmit(role, techStack, experience);
    }
  };

  const experienceOptions = [
    { value: "0-1", label: "0-1 years" },
    { value: "1-3", label: "1-3 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5+", label: "5+ years" },
  ];

  const popularRoles = [
    "Software Engineer",
    "Data Scientist",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer",
    "ML Engineer",
  ];

  const popularTechStacks = [
    "React, Node.js",
    "Python, TensorFlow",
    "Java, Spring",
    "JavaScript, React",
    "Python, Django",
    "Go, Docker",
  ];

  return (
    <GlassMorphism className="p-6 max-w-2xl mx-auto" intensity="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Briefcase size={16} />
            Job Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Software Engineer"
            className="w-full px-4 py-2 bg-white/20 dark:bg-black/20 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
            required
          />
          <div className="pt-2 flex flex-wrap gap-2">
            {popularRoles.map((popularRole) => (
              <button
                key={popularRole}
                type="button"
                onClick={() => setRole(popularRole)}
                className="px-3 py-1 text-xs bg-secondary text-foreground rounded-full hover:bg-secondary/70 transition-colors"
              >
                {popularRole}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="techStack"
            className="block text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Code size={16} />
            Tech Stack
          </label>
          <input
            id="techStack"
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="e.g., React, Python"
            className="w-full px-4 py-2 bg-white/20 dark:bg-black/20 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
            required
          />
          <div className="pt-2 flex flex-wrap gap-2">
            {popularTechStacks.map((stack) => (
              <button
                key={stack}
                type="button"
                onClick={() => setTechStack(stack)}
                className="px-3 py-1 text-xs bg-secondary text-foreground rounded-full hover:bg-secondary/70 transition-colors"
              >
                {stack}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="experience"
            className="block text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Clock size={16} />
            Experience
          </label>
          <div className="grid grid-cols-4 gap-2">
            {experienceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setExperience(option.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  experience === option.value
                    ? "bg-primary text-white"
                    : "bg-white/20 dark:bg-black/20 text-foreground hover:bg-white/30 dark:hover:bg-black/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !role.trim() || !techStack.trim()}
          className={`w-full px-4 py-2 text-white font-medium bg-primary rounded-lg transition-all ${
            !role.trim() || !techStack.trim() || isLoading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-primary/90"
          }`}
        >
          {isLoading ? "Setting Up..." : "Start Interview"}
        </button>
      </form>
    </GlassMorphism>
  );
};

export default InterviewSetup;
