import { LearningModule } from "./types";

export const llmEvaluationSafety: LearningModule = {
  id: "llm-evaluation-safety",
  title: "LLM Evaluation and Safety",
  category: "LLM Evaluation and Safety",
  prerequisites: ["llms"],
  tracks: ["modern-ai"],
  difficulty: 3,
  estimatedMinutes: 35,
  shortDescription: "Methodologies for assessing language model performance and alignment, including automated benchmarks, LLM-as-a-judge, red teaming, and prompt injection mitigation.",
  learningObjectives: [
    "Differentiate task-specific automated metrics like BLEU and ROUGE from model-based evaluation.",
    "Design and implement an LLM-as-a-judge evaluation protocol to measure qualitative dimensions.",
    "Identify methods for detecting benchmark contamination and leakage in training datasets.",
    "Formulate strategies for defending against prompt injection and jailbreak attacks.",
    "Evaluate LLM outputs for safety violations, including toxicity, leakage of private data, and hallucination."
  ],
  keyTerms: [
    {
      term: "LLM-as-a-Judge",
      definition: "An evaluation paradigm that uses a highly capable language model to grade the responses of other models based on structured criteria and rubrics."
    },
    {
      term: "Prompt Injection",
      definition: "An attack vector where untrusted user input manipulates the prompt instructions to override system guardrails and hijack model behavior."
    },
    {
      term: "Benchmark Contamination",
      definition: "The inclusion of test questions or evaluation data from benchmarks in the training or fine-tuning set of a model, inflating its apparent scores."
    },
    {
      term: "Red Teaming",
      definition: "The systematic process of probing or attacking an AI model to discover safety flaws, vulnerabilities, and undesired model responses."
    }
  ],
  workedExamples: [
    {
      title: "LLM-as-a-Judge Prompt Schema Design",
      problem: "Draft a system prompt template for an LLM-as-a-judge to evaluate an assistant's response for helpfulness, accuracy, and detail on a scale of 1 to 5, outputting the reasoning and final score in a structured JSON format.",
      solution: "Here is the structured evaluation template:\n\n```text\nSystem Prompt:\nYou are an expert evaluator. Grade the assistant response below on a scale of 1 to 5 based on: helpfulness, accuracy, and detail.\n\nUser Prompt: [INSERT USER PROMPT]\nAssistant Response: [INSERT RESPONSE TO EVALUATE]\n\nOutput your evaluation exactly in this JSON format:\n{\n  \"reasoning\": \"Step-by-step evaluation details...\",\n  \"helpfulness_score\": 1-5,\n  \"accuracy_score\": 1-5,\n  \"detail_score\": 1-5,\n  \"final_average\": 1.0-5.0\n}\n```\n\nThis template ensures the judge model provides logical explanations for its grades, improving evaluation stability and auditability."
    }
  ],
  misconceptions: [
    {
      claim: "High scores on standard benchmarks (like MMLU or GSM8K) guarantee that a model is ready for general production use.",
      correction: "Standard benchmarks do not cover custom task contexts, user behavior, safety risks, or edge cases. Additionally, benchmarks are frequently contaminated (leak into training datasets), making custom evaluations and red teaming essential before deployment."
    },
    {
      claim: "Prompt injection can be completely solved by using a clever system prompt that tells the model not to ignore instructions.",
      correction: "Because language models mix system instructions and user inputs in a single text stream, system prompts are only a partial defense. Secure applications require input sanitization, separate system channels, output checks, and restricted execution privileges."
    }
  ],
  references: [
    {
      title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena",
      authors: "Lianmin Zheng, Wei-Lin Chiang, Hao Zhang, et al.",
      url: "https://arxiv.org/abs/2306.05685",
      type: "paper"
    },
    {
      title: "OWASP Top 10 for Large Language Model Applications",
      authors: "OWASP Foundation",
      url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
      type: "documentation"
    }
  ],
  failureModes: [
    {
      name: "Judge Bias",
      description: "When using LLM-as-a-judge, the evaluator model may favor responses that are longer, formatted nicely, or written by its own architecture (self-enhancement bias).",
      mitigation: "Use strict rubrics, switch candidate order to eliminate position bias, and ground the evaluation against human-reviewed golden datasets."
    },
    {
      name: "Toxicity and Jailbreaking",
      description: "Users bypass safety filters using complex roleplay prompts (jailbreaks) to force the model to generate harmful advice, malware, or toxic content.",
      mitigation: "Deploy a separate guardrail model (e.g. Llama Guard) to filter both incoming queries and outgoing responses before they reach the user."
    }
  ],
  pros: [
    "LLM-as-a-judge provides cheap, rapid, scalable feedback compared to expensive human evaluation.",
    "Red teaming uncovers security vulnerabilities before models are deployed in production.",
    "Guardrail models enforce system compliance and protect brand safety."
  ],
  cons: [
    "Automated metrics like BLEU and ROUGE correlate poorly with human judgments of quality.",
    "Evaluating safety is an adversarial arms race; hackers continuously discover new jailbreak techniques.",
    "Rigorous evaluation can be costly, requiring thousands of model calls."
  ],
  intuition: "How do we know if a language model is actually good, and more importantly, if it is safe? We can't just test it on simple math equations. Evaluation is hard because natural language is open-ended. To solve this, we use standard benchmarks for general knowledge, LLM-as-a-judge for complex qualities (like tone and helpfulness), and red teaming (adversarial hacking) to find holes in our defenses. Safety is about establishing guardrails: verifying that the model doesn't leak secrets, help build dangerous weapons, or get tricked into ignoring its instructions by clever user prompts.",
  mathematics: "### ROUGE-N Recall Calculation\n\nROUGE-N measures the overlap of $N$-grams between a generated candidate text $C$ and a reference text $R$.\n$$\\text{ROUGE-N}_{\\text{Recall}} = \\frac{\\sum_{s \\in R} \\sum_{\\text{gram}_N \\in s} \\text{Count}_{\\text{match}}(\\text{gram}_N)}{\\sum_{s \\in R} \\sum_{\\text{gram}_N \\in s} \\text{Count}(\\text{gram}_N)}$$\nwhere $\\text{Count}_{\\text{match}}(\\text{gram}_N)$ is the number of co-occurring $N$-grams in both the candidate and reference texts.\n\n### Pairwise Win-Rate Calculation\n\nIn a chatbot arena setting where model $A$ and model $B$ compete, we model the probability that model $A$ defeats model $B$ using the Elo rating system. Given their respective ratings $R_A$ and $R_B$, the expected win probability $E_A$ is:\n$$E_A = \\frac{1}{1 + 10^{(R_B - R_A)/400}}$$\nAfter a match with outcome $S_A$ ($1.0$ for a win, $0.5$ for a tie, $0.0$ for a loss), the rating for model $A$ is updated as:\n$$R_A^{\\text{new}} = R_A^{\\text{old}} + K(S_A - E_A)$$\nwhere $K$ is the rating update factor.",
  fullDescription: "LLM Evaluation and Safety covers the techniques used to measure language model capabilities and prevent malicious misuse. It covers automated performance benchmarks, LLM-as-a-judge protocols, red teaming strategies, and input/output guardrails.",
  codeSnippet: `/**
 * Simple Guardrail and Prompt Sanitizer for LLM Applications
 */
export class LLMGuardrail {
  private blockedKeywords: string[] = [
    "ignore previous instructions",
    "system prompt",
    "bypass safety",
    "jailbreak"
  ];

  constructor(private toxicityThreshold: number = 0.7) {}

  /**
   * Simple mock toxicity scorer (in production, use a classification model)
   */
  private computeToxicity(text: string): number {
    const toxicWords = ["hate", "kill", "harm", "abuse", "steal"];
    const words = text.toLowerCase().split(/\\s+/);
    let count = 0;
    
    words.forEach(w => {
      if (toxicWords.includes(w)) count++;
    });

    return count / Math.max(1, words.length);
  }

  /**
   * Sanitizes input to detect and block prompt injection attempts
   */
  checkInput(userInput: string): { allowed: boolean; reason: string } {
    const normalized = userInput.toLowerCase();

    // Check for prompt injection keyword patterns
    for (const keyword of this.blockedKeywords) {
      if (normalized.includes(keyword)) {
        return {
          allowed: false,
          reason: "Blocked due to injection keyword: " + keyword
        };
      }
    }

    // Check input toxicity
    const toxicity = this.computeToxicity(userInput);
    if (toxicity > this.toxicityThreshold) {
      return {
        allowed: false,
        reason: "Blocked due to potential toxicity"
      };
    }

    return { allowed: true, reason: "" };
  }

  /**
   * Filters LLM outputs before returning them to the user
   */
  checkOutput(modelOutput: string): string {
    const toxicity = this.computeToxicity(modelOutput);
    
    if (toxicity > this.toxicityThreshold) {
      return "Response blocked: Generative output violated safety guidelines.";
    }

    return modelOutput;
  }
}`,
  relatedModules: ["llms", "evaluation-metrics", "bias-variance"]
};
