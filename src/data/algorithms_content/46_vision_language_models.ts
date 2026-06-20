import { LearningModule } from "./types";

export const visionLanguageModels: LearningModule = {
  id: "vision-language-models",
  title: "Vision-Language Models (CLIP)",
  category: "Computer Vision",
  prerequisites: ["vision-transformers", "transformers"],
  tracks: ["computer-vision"],
  difficulty: 4,
  relatedModules: ["vision-transformers", "transformers", "self-supervised-vision", "diffusion-models"],
  shortDescription:
    "Align images and text in one shared embedding space by contrastive training on web-scale image–caption pairs — so a model can classify, retrieve, and reason about images using natural-language prompts, zero-shot.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Explain CLIP's dual-encoder design and how contrastive training aligns image and text embeddings in a shared space",
    "Describe zero-shot classification by embedding text prompts and matching the nearest image embedding",
    "Reason about why web-scale natural-language supervision generalizes and transfers more robustly than fixed-label training",
    "Identify the limitations of vision-language models — bias, fine-grained and compositional weaknesses, and prompt sensitivity",
  ],
  keyTerms: [
    {
      term: "Dual Encoder",
      definition:
        "Two separate networks — an image encoder (often a ViT) and a text encoder (a Transformer) — that map their inputs into the *same* embedding space so similarity can be measured by a dot product.",
    },
    {
      term: "Contrastive Image–Text Pretraining",
      definition:
        "Training on (image, caption) pairs so that matching pairs have high cosine similarity and mismatched pairs low — a symmetric InfoNCE loss over the batch's similarity matrix.",
    },
    {
      term: "Zero-Shot Classification",
      definition:
        "Classifying into categories never seen during a supervised phase by embedding text prompts like 'a photo of a {label}' and picking the label whose embedding is closest to the image embedding.",
    },
    {
      term: "Shared Embedding Space",
      definition:
        "A single vector space in which an image and a text that describes it land near each other, enabling cross-modal retrieval and open-vocabulary recognition.",
    },
  ],
  misconceptions: [
    {
      claim:
        "CLIP is trained to classify images into a fixed set of categories.",
      correction:
        "CLIP is never trained on a fixed label set. It is trained contrastively to align images with their captions. Classification is an *emergent* zero-shot use: embed candidate label prompts and pick the nearest — so the 'classes' are open-vocabulary, defined at inference by the text you provide.",
    },
    {
      claim:
        "'Zero-shot' means the model did no training.",
      correction:
        "It means no *task-specific labeled* training for the new classes. CLIP was heavily pretrained on hundreds of millions of image–text pairs; zero-shot refers to transferring that knowledge to a new task with only natural-language prompts, not fine-tuning on labeled examples of it.",
    },
    {
      claim:
        "A vision-language model understands images the way humans do.",
      correction:
        "These models inherit web biases and are weak at fine-grained distinctions, counting, spatial relations, and compositional reasoning — often behaving like a bag of concepts. Strong zero-shot accuracy on common objects does not imply robust, human-like understanding.",
    },
  ],
  references: [
    {
      title: "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
      authors: "Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., et al.",
      url: "https://arxiv.org/abs/2103.00020",
      type: "paper",
    },
    {
      title: "Scaling Up Visual and Vision-Language Representation Learning With Noisy Text Supervision (ALIGN)",
      authors: "Jia, C., Yang, Y., Xia, Y., Chen, Y.-T., et al.",
      url: "https://arxiv.org/abs/2102.05918",
      type: "paper",
    },
    {
      title: "BLIP: Bootstrapping Language-Image Pre-training for Unified Vision-Language Understanding and Generation",
      authors: "Li, J., Li, D., Xiong, C. and Hoi, S.",
      url: "https://arxiv.org/abs/2201.12086",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Fine-grained and compositional failures",
      description:
        "CLIP-style models often act like a bag of concepts: they reliably detect 'dog' and 'frisbee' but confuse which object is left of which, miscount, or fail to distinguish closely-related species or models, because the contrastive objective rewards global match more than precise structure.",
      mitigation:
        "Use ensembled and templated prompts, fine-tune on the target domain, or adopt models with stronger grounding/region alignment; verify on a compositional benchmark rather than only coarse classification.",
    },
    {
      name: "Inherited bias and unsafe associations",
      description:
        "Trained on uncurated web pairs, these models absorb social biases and can make harmful or stereotyped associations, and their zero-shot scores can be sensitive to prompt wording.",
      mitigation:
        "Audit on bias benchmarks, curate or filter training data, calibrate/templated prompts, and keep a human in the loop for sensitive deployments.",
    },
  ],
  fullDescription: `
A vision-language model learns images and text *together*, in one shared representation. CLIP (Contrastive Language–Image Pretraining) is the canonical example, and its recipe is strikingly simple.

### The recipe
1. Collect hundreds of millions of **(image, caption)** pairs from the web — no manual labels.
2. Run each image through an **image encoder** (a ViT or CNN) and each caption through a **text encoder** (a Transformer), projecting both into the same embedding space.
3. Train **contrastively**: in a batch of $N$ pairs, the $N$ matching image–text pairs should have high similarity and the $N^2 - N$ mismatched pairs low. That is it — no class labels anywhere.

### What you get for free
Because supervision comes from *language*, the model is not boxed into a fixed label set. To classify an image **zero-shot**, you write the candidate classes as text — "a photo of a cat", "a photo of a dog" — embed them, and pick the one closest to the image embedding. The same shared space enables **image–text retrieval** (search images by sentence, or vice versa) and serves as the backbone for **captioning** and **visual question answering** (BLIP, Flamingo) and for steering **text-to-image generation** (the text encoder in diffusion models).

### Why it generalizes
Natural-language supervision is broad and open-ended, so CLIP learns concepts far beyond any curated label list and transfers robustly — famously matching a supervised ResNet-50 on ImageNet *without ever training on ImageNet's labels*, while being markedly more robust to distribution shift. The trade-offs are real: web-scale data carries bias, and the global contrastive objective leaves the models weak at fine-grained and compositional reasoning.
  `,
  intuition: `
Imagine teaching someone about the world not with flashcards that say "this is exactly a Labrador," but by showing them millions of photos each paired with whatever caption a human wrote on the internet. They never get a tidy list of categories — just images and the words people naturally used. Over time they build a single mental space where a picture of a beach and the phrase "a sunny shoreline" sit in the same place.

Now you can quiz them in plain language. Show a new photo and ask "is this closer to 'a cat' or 'a car'?" — they just check which phrase feels nearest to the picture in that shared mental space. You never trained them on a "cat-vs-car" task; you simply *described* the options in words, and they matched. That is zero-shot classification, and it works for any labels you can phrase. The catch is that learning from messy web captions, they pick up the internet's blind spots and biases, and they grasp the gist of a scene better than its fine print — who is holding what, how many there are, exactly which breed.
  `,
  mathematics: `
### 1. The shared embedding
The image encoder $f$ and text encoder $g$ map an image $I$ and text $T$ to L2-normalized vectors in $\\mathbb{R}^d$:

$$ u = \\frac{f(I)}{\\lVert f(I)\\rVert}, \\qquad v = \\frac{g(T)}{\\lVert g(T)\\rVert}, \\qquad \\text{sim}(I,T) = u^{\\top} v. $$

### 2. Symmetric contrastive loss
For a batch of $N$ pairs, form the $N\\times N$ similarity matrix $S_{ij} = u_i^{\\top} v_j / \\tau$ with a learned temperature $\\tau$. The diagonal holds the true pairs. The loss is a symmetric cross-entropy that treats each row and each column as an $N$-way classification of "which is my match?":

$$ \\mathcal{L} = \\tfrac{1}{2}\\Big(\\underbrace{-\\frac{1}{N}\\sum_i \\log\\frac{e^{S_{ii}}}{\\sum_j e^{S_{ij}}}}_{\\text{image}\\to\\text{text}} \\;+\\; \\underbrace{-\\frac{1}{N}\\sum_j \\log\\frac{e^{S_{jj}}}{\\sum_i e^{S_{ij}}}}_{\\text{text}\\to\\text{image}}\\Big). $$

### 3. Zero-shot classification
Given classes $\\{c_1,\\dots,c_K\\}$, build a prompt $T_k = $ "a photo of a $c_k$", embed each, and predict the class whose text embedding is most similar to the image:

$$ \\hat{y} = \\arg\\max_{k}\\; u^{\\top} v_k. $$

No gradient steps, no labeled examples of the new classes — only their names, written as text.
  `,
  pros: [
    "Open-vocabulary: classify, retrieve, or filter by any natural-language prompt without task-specific labels or retraining.",
    "Strong zero-shot transfer and notable robustness to distribution shift, learned from cheap web-scale image–text pairs.",
    "A reusable shared embedding that powers retrieval, captioning, VQA, and text-conditioning for image generation (e.g. diffusion).",
  ],
  cons: [
    "Inherits web-scale social biases and unsafe associations from uncurated training data.",
    "Weak at fine-grained recognition, counting, spatial relations, and compositional reasoning — often behaving like a bag of concepts.",
    "Sensitive to prompt wording, and requires enormous data and compute to train from scratch.",
  ],
  codeSnippet: `import torch
import torch.nn.functional as F

# Pretend encoders already produced L2-normalized embeddings (dim 512).
image_emb = F.normalize(torch.randn(1, 512), dim=1)            # one image
labels = ["a photo of a cat", "a photo of a dog", "a photo of a car"]
text_emb = F.normalize(torch.randn(len(labels), 512), dim=1)  # one row per prompt

# Zero-shot classification = nearest text prompt in the shared space.
logits = (image_emb @ text_emb.t()) / 0.07     # cosine similarity / temperature
probs = logits.softmax(dim=1)
pred = labels[int(probs.argmax())]
print("Prediction:", pred, "  probs:", [round(p, 3) for p in probs[0].tolist()])

# Training (sketch): build the NxN image-text similarity matrix for a batch and
# apply symmetric cross-entropy so the diagonal (true pairs) scores highest.`,
  tldr: [
    "**Vision-language models** (CLIP) train a **dual encoder** — image + text — to share one embedding space, using **contrastive** learning on web-scale (image, caption) pairs.",
    "The objective: in a batch, matching image–text pairs get high cosine similarity, mismatched pairs low — a **symmetric InfoNCE** over the similarity matrix, with no class labels.",
    "**Zero-shot classification**: embed text prompts ('a photo of a {label}') and pick the label whose embedding is nearest the image — open-vocabulary, defined at inference.",
    "Natural-language supervision generalizes broadly and transfers **robustly** — CLIP matched a supervised ResNet-50 on ImageNet *without ImageNet labels*.",
    "The shared space also powers **retrieval, captioning, VQA**, and **text-to-image** conditioning (the text encoder in diffusion models).",
    "Limits: **web bias**, and weakness at **fine-grained, counting, and compositional** reasoning — strong gist, weak fine print.",
  ],
  additionalSections: [
    {
      heading: "Derivation: Why Natural-Language Supervision Beats Fixed Labels",
      content: `
Standard supervised vision trains against a closed set of $K$ labels. That choice quietly limits everything: the model can only ever output one of $K$ categories, the labels carry no relationship to each other (a "Siberian husky" and a "wolf" are just indices 247 and 269), and collecting them is expensive, so datasets stay small and narrow. The supervision signal per image is a single integer.

CLIP replaces the integer with a **sentence**. A caption like "a Siberian husky pulling a sled in the snow" contains vastly more information than the label index 247: the object, its activity, the setting, and — across millions of captions — the *relationships* between concepts as they co-occur in language. Three consequences follow.

First, **scale**: captions are free to scrape, so the dataset grows to hundreds of millions of pairs spanning concepts no curated label set would include. Second, **an open output space**: because both sides are embedded by a text encoder, the set of recognizable concepts is whatever language can express, decided at inference by the prompt — not frozen at training time. This is exactly what makes zero-shot classification possible: a never-trained class is just a new sentence to embed. Third, **robustness**: a classifier trained on ImageNet learns features that exploit that dataset's quirks and degrades sharply under distribution shift; CLIP's language-grounded features, learned from diverse web data, transfer far more gracefully — it matched a supervised ResNet-50's ImageNet accuracy *zero-shot* while dropping much less on shifted variants like ImageNet-R and ImageNet-Sketch. The contrastive loss is the mechanism, but the deeper lesson is that **richer, more natural supervision yields more general representations** — the same lesson, in a different modality, that drives large language models.
      `,
    },
  ],
  comparisons: [
    {
      title: "Supervised Classifier vs CLIP (Vision-Language)",
      methods: ["Supervised CNN/ViT", "CLIP (Vision-Language)"],
      rows: [
        {
          dimension: "Supervision",
          values: ["Fixed integer labels", "Natural-language captions"],
        },
        {
          dimension: "Output space",
          values: ["Closed set of K classes", "Open vocabulary (any text prompt)"],
        },
        {
          dimension: "New classes",
          values: ["Require labeled data + retraining", "Just write a new prompt (zero-shot)"],
        },
        {
          dimension: "Robustness to shift",
          values: ["Often brittle", "Markedly more robust"],
        },
        {
          dimension: "Beyond classification",
          values: ["Needs new heads/training", "Retrieval, captioning, VQA, gen. conditioning"],
        },
      ],
      takeaway:
        "Language supervision trades a clean fixed taxonomy for an open, transferable, multi-purpose representation — powerful and flexible, but carrying web bias and weaker fine-grained precision.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You need **open-vocabulary** classification, tagging, or moderation where the categories change or are not known in advance.",
      "You want **cross-modal retrieval** — search images with text (or text with images) in a shared space.",
      "You have **no labeled data** for the target classes but can describe them in words (zero-shot).",
      "You need a **text-conditioning** backbone for generation or a strong general image encoder to build on.",
    ],
    avoidWhen: [
      "The task needs **fine-grained, counting, or spatial/compositional** precision that bag-of-concepts models handle poorly.",
      "The application is **bias-sensitive or safety-critical** without auditing and mitigation of web-inherited biases.",
      "You have ample labeled data for a fixed taxonomy and need maximum accuracy — a fine-tuned supervised model may win.",
      "Latency or memory budgets cannot fit running two encoders, or prompts cannot be reliably engineered.",
    ],
    rulesOfThumb: [
      "Use prompt templates and ensembling ('a photo of a {label}', plus variants) — wording materially affects zero-shot accuracy.",
      "Treat zero-shot as a strong baseline; fine-tune (or linear-probe) on the target domain when you need the last few points.",
      "Audit for bias and test on a compositional benchmark before trusting the model beyond coarse recognition.",
    ],
  },
  caseStudies: [
    {
      title: "CLIP classifies ImageNet zero-shot — without ImageNet labels",
      domain: "Vision-language representation learning",
      scenario:
        "Supervised models defined a closed taxonomy and were brittle under distribution shift, while collecting labels was the bottleneck. The question was whether learning purely from naturally-occurring image–text pairs could yield a general, transferable visual model that needed no task-specific labels.",
      approach:
        "Radford et al. trained CLIP on ~400M image–text pairs scraped from the web with a symmetric contrastive objective over dual ViT/Transformer encoders. To classify, they embedded prompts like 'a photo of a {label}' for the target classes and chose the nearest text embedding to each image — no fine-tuning on the target dataset.",
      outcome:
        "CLIP reached about **76.2% zero-shot top-1 on ImageNet**, matching a fully-supervised ResNet-50 trained on ImageNet's 1.28M labeled images — while using *none* of those labels — and it degraded far less on shifted test sets (ImageNet-R, ImageNet-Sketch, ImageNet-A). The shared embedding space went on to power retrieval, captioning/VQA systems, and the text conditioning in modern text-to-image diffusion models.",
      source: {
        title: "Learning Transferable Visual Models From Natural Language Supervision",
        authors: "Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., et al.",
        url: "https://arxiv.org/abs/2103.00020",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "How does CLIP perform zero-shot classification into classes it never explicitly trained on?",
      options: [
        {
          text: "It embeds text prompts for the candidate classes and predicts the one whose embedding is closest to the image embedding.",
          correct: true,
        },
        {
          text: "It retrains a softmax head on labeled examples of the new classes.",
          correct: false,
        },
        {
          text: "It looks up the image in a database of memorized labels.",
          correct: false,
        },
        {
          text: "It generates a caption and parses the first noun.",
          correct: false,
        },
      ],
      explanation:
        "Because image and text share an embedding space, classification is just nearest-neighbor matching: embed prompts like 'a photo of a {label}', compute cosine similarity to the image embedding, and take the argmax. No labeled examples or gradient steps for the new classes are needed — the class set is defined by the prompts at inference.",
    },
    {
      question:
        "What objective does CLIP use during pretraining?",
      options: [
        {
          text: "A symmetric contrastive loss: matching image–text pairs in a batch get high similarity, mismatched pairs low.",
          correct: true,
        },
        {
          text: "Cross-entropy against a fixed set of 1000 class labels.",
          correct: false,
        },
        {
          text: "Pixel reconstruction of masked image patches.",
          correct: false,
        },
        {
          text: "An adversarial generator–discriminator game.",
          correct: false,
        },
      ],
      explanation:
        "CLIP builds the N×N image–text similarity matrix for a batch and applies symmetric cross-entropy so each image matches its caption and vice versa — the diagonal (true pairs) should score highest. There are no class labels; the supervision is which caption goes with which image.",
    },
    {
      question:
        "Why does language supervision tend to transfer more robustly than fixed-label supervision?",
      options: [
        {
          text: "Captions carry richer, open-ended information and span far more concepts, giving an open output space and features less tied to one dataset's quirks.",
          correct: true,
        },
        {
          text: "Because text encoders are always larger than image encoders.",
          correct: false,
        },
        {
          text: "Because language data never contains any bias.",
          correct: false,
        },
        {
          text: "Because it avoids using neural networks entirely.",
          correct: false,
        },
      ],
      explanation:
        "A label is a single integer; a caption describes objects, attributes, actions, and context, and across millions of captions encodes concept relationships. This yields an open, language-defined output space and broadly-grounded features, so CLIP transfers zero-shot and is far more robust to distribution shift than a classifier fit to one closed taxonomy.",
    },
    {
      question:
        "Which is a well-documented limitation of CLIP-style vision-language models?",
      options: [
        {
          text: "Weakness at fine-grained, counting, and compositional/spatial reasoning, plus inherited web bias — they capture the gist better than the fine print.",
          correct: true,
        },
        {
          text: "They can only process grayscale images.",
          correct: false,
        },
        {
          text: "They require per-class labeled data for every prediction.",
          correct: false,
        },
        {
          text: "They cannot be used for image retrieval.",
          correct: false,
        },
      ],
      explanation:
        "The global contrastive objective rewards overall image–text match, so these models often behave like a bag of concepts: strong on coarse recognition but weak at distinguishing fine-grained categories, counting, and spatial/compositional relations — and, trained on uncurated web data, they absorb social biases.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Describe how CLIP is trained and how that training enables zero-shot, open-vocabulary classification, then name two limitations.",
      expectedAnswerRubric:
        "A strong answer should explain that CLIP uses a dual encoder (image encoder + text encoder) projecting both modalities into a shared L2-normalized embedding space, trained contrastively on web-scale (image, caption) pairs: for each batch it forms the N×N similarity matrix and applies symmetric cross-entropy so matching image–text pairs (the diagonal) score highest and mismatches low — with no class labels. It should explain that because supervision is natural language, the output space is open: to classify zero-shot you embed text prompts ('a photo of a {label}') for any candidate classes and take the argmax cosine similarity to the image embedding, needing no labeled examples or fine-tuning for the new classes. It should note that this generalizes/transfers robustly (e.g. matching a supervised ResNet-50 on ImageNet without its labels, more robust to shift). Two limitations: inherited web/social bias, and weakness at fine-grained/counting/compositional/spatial reasoning (bag-of-concepts behavior); prompt sensitivity is also acceptable.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
