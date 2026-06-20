import { LearningModule } from "./types";

export const selfSupervisedVision: LearningModule = {
  id: "self-supervised-vision",
  title: "Self-Supervised Visual Pretraining",
  category: "Computer Vision",
  prerequisites: ["cnn", "vision-transformers"],
  tracks: ["computer-vision"],
  difficulty: 4,
  relatedModules: ["vision-transformers", "cnn", "autoencoders", "computer-vision"],
  shortDescription:
    "Learn powerful visual representations from images alone — no labels — by inventing a pretext task: contrast augmented views (SimCLR), reconstruct masked patches (MAE), or match a teacher (DINO). The labels come later, for a small fine-tuning step.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Explain why self-supervised pretraining matters: labels are expensive but unlabeled images are abundant",
    "Describe the three dominant families — contrastive (SimCLR), masked image modeling (MAE), and self-distillation (DINO)",
    "Explain how contrastive learning builds positives from augmentations and pushes apart negatives without any labels",
    "Evaluate a learned representation with linear probing vs fine-tuning and reason about when SSL pays off",
  ],
  keyTerms: [
    {
      term: "Pretext Task",
      definition:
        "A label-free task invented purely to force a network to learn useful features — e.g. tell two augmentations of the same image apart from others, or reconstruct hidden patches. The task is a means; the representation is the goal.",
    },
    {
      term: "Contrastive Learning",
      definition:
        "Pulling representations of two augmented views of the same image (a positive pair) together while pushing apart views of different images (negatives), typically with the InfoNCE/NT-Xent loss.",
    },
    {
      term: "Masked Image Modeling",
      definition:
        "Hiding a large fraction of image patches and training the network to reconstruct them from the visible ones (MAE) — the vision analogue of masked-language modeling.",
    },
    {
      term: "Linear Probe",
      definition:
        "A standard evaluation that freezes the pretrained encoder and trains only a linear classifier on top, measuring how linearly separable (i.e. how good) the learned features are.",
    },
  ],
  misconceptions: [
    {
      claim:
        "Self-supervised learning needs no data, just no labels.",
      correction:
        "It still needs a large corpus of *unlabeled* images — often more than supervised training. What it avoids is the expensive human *annotation*, not the data itself. The win is using cheap, abundant unlabeled images.",
    },
    {
      claim:
        "The pretext task (reconstructing patches, contrasting views) is the end goal.",
      correction:
        "The pretext task is a scaffold. Nobody cares about the reconstructed patches per se — they exist to force the encoder to learn transferable features, which are then evaluated by a linear probe or fine-tuned on a real downstream task.",
    },
    {
      claim:
        "Contrastive learning needs class labels to know which pairs are positive.",
      correction:
        "Positives are two random augmentations (crop, color jitter, blur) of the *same* image; negatives are other images in the batch. No class labels are involved — the supervision signal is manufactured from the data and the augmentation pipeline.",
    },
  ],
  references: [
    {
      title: "A Simple Framework for Contrastive Learning of Visual Representations (SimCLR)",
      authors: "Chen, T., Kornblith, S., Norouzi, M. and Hinton, G.",
      url: "https://arxiv.org/abs/2002.05709",
      type: "paper",
    },
    {
      title: "Masked Autoencoders Are Scalable Vision Learners (MAE)",
      authors: "He, K., Chen, X., Xie, S., Li, Y., Dollár, P. and Girshick, R.",
      url: "https://arxiv.org/abs/2111.06377",
      type: "paper",
    },
    {
      title: "Emerging Properties in Self-Supervised Vision Transformers (DINO)",
      authors: "Caron, M., Touvron, H., Misra, I., Jégou, H., et al.",
      url: "https://arxiv.org/abs/2104.14294",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Representation collapse",
      description:
        "Self-distillation and non-contrastive methods can cheat by mapping every image to the same constant vector — the loss looks low but the features are useless.",
      mitigation:
        "Use negatives (contrastive InfoNCE), or collapse-preventing tricks: a momentum/EMA teacher with output centering and sharpening (DINO/BYOL), stop-gradient, or redundancy-reduction objectives.",
    },
    {
      name: "Augmentation or mask mismatch with the downstream task",
      description:
        "The learned invariances are dictated by the pretext design. Heavy color jitter teaches color invariance, which hurts if color is class-relevant; a mask ratio or crop scale tuned for one domain may transfer poorly to another.",
      mitigation:
        "Match augmentations/masking to what should be invariant for the target task, validate with a linear probe, and adjust the pretext (e.g. lower mask ratio, milder color augmentation) for the domain.",
    },
  ],
  fullDescription: `
Supervised vision needs millions of human-labeled images, and labels are slow and expensive. **Self-supervised learning (SSL)** sidesteps this: it manufactures a supervisory signal *from the images themselves* by inventing a **pretext task**, learns a strong general-purpose encoder, and only then uses a small labeled set to adapt to a real task.

### Three families
1. **Contrastive (SimCLR, MoCo).** Make two augmented views of the same image — a *positive pair* — and train the encoder so their embeddings are close, while embeddings of *other* images (negatives) are far. The model must learn what is essential about an image to recognize it across crops, color shifts, and blur.
2. **Masked image modeling (MAE, BEiT).** Hide a large fraction of image patches (MAE masks ~75%) and train the network to reconstruct the missing content from the visible patches. To fill the gaps it must learn objects, parts, and context — like masked-language modeling for vision.
3. **Self-distillation (DINO, BYOL).** A *student* network is trained to match the output of a slowly-updated *teacher* (an exponential moving average of the student) on different views, with tricks to avoid collapse — and no negatives at all.

### Why it matters
A good SSL encoder transfers: freeze it and a simple **linear probe** already classifies well, or **fine-tune** it with a fraction of the labels supervised training would need. SSL pretraining now underlies much of modern vision (and powers foundation models), because it converts cheap unlabeled images into reusable representations.
  `,
  intuition: `
Think about how a child learns to see long before anyone teaches them the *word* "dog." They watch the world, notice that an object looks like the same thing from different angles and lighting, and learn to fill in what is hidden behind a couch. Only later does a parent attach a few labels — and the child generalizes instantly, because the hard work of *building a visual world model* was already done, unsupervised.

Self-supervised pretraining is that childhood. The network plays games with unlabeled images: "are these two weird crops the same photo?" (contrastive), "what was behind these patches I hid from you?" (masked modeling), "do you agree with your calmer, slower self about this view?" (self-distillation). None of these games needs a human to say what anything *is*. But to win them, the network is forced to discover edges, textures, parts, objects, and context. When you finally hand it a small labeled dataset, it barely needs it — like the child who already understood dogs and just needed the name.
  `,
  mathematics: `
### 1. Contrastive loss (InfoNCE / NT-Xent)
For a positive pair of embeddings $(z_i, z_j)$ from two views of one image, with other batch items as negatives and temperature $\\tau$, the loss for $z_i$ uses cosine similarity $\\text{sim}(\\cdot,\\cdot)$:

$$ \\mathcal{L}_{i,j} = -\\log \\frac{\\exp\\!\\big(\\text{sim}(z_i, z_j)/\\tau\\big)}{\\sum_{k \\ne i}\\exp\\!\\big(\\text{sim}(z_i, z_k)/\\tau\\big)}. $$

Minimizing it raises the positive pair's similarity while lowering similarity to all negatives — a softmax that must pick the true match out of the batch.

### 2. Masked reconstruction (MAE)
Mask a subset $M$ of patches; the decoder predicts pixels $\\hat x_p$ for $p \\in M$ from the visible patches, trained with mean-squared error on the masked patches only:

$$ \\mathcal{L}_{\\text{MAE}} = \\frac{1}{|M|}\\sum_{p \\in M}\\lVert \\hat x_p - x_p \\rVert^2. $$

Because the encoder sees only the visible patches, a 75% mask makes pretraining several times cheaper than processing the full image.

### 3. Evaluation
The pretrained encoder $f$ is judged not on the pretext loss but downstream: a **linear probe** freezes $f$ and fits only a linear head $W$,

$$ \\min_{W}\\; \\mathbb{E}_{(x,y)}\\big[\\,\\ell\\big(W f(x),\\, y\\big)\\big], $$

so accuracy reflects the quality of the frozen features; **fine-tuning** instead updates $f$ too.
  `,
  pros: [
    "Exploits abundant unlabeled images, slashing the need for expensive human annotation and enabling label-efficient downstream learning.",
    "Produces strong, transferable general-purpose encoders — the backbone of modern vision foundation models — that fine-tune well across many tasks.",
    "Masked modeling (MAE) is highly scalable: encoding only visible patches makes large-model pretraining substantially cheaper.",
  ],
  cons: [
    "Sensitive to design choices: augmentations, mask ratio, temperature, and (for non-contrastive methods) anti-collapse tricks must be tuned.",
    "Pretraining is compute- and data-intensive, and the value only materializes through a downstream evaluation/fine-tuning step.",
    "The learned invariances are dictated by the pretext task and may mismatch a downstream task where the 'nuisance' factor is actually informative.",
  ],
  codeSnippet: `import torch
import torch.nn.functional as F

def nt_xent(z, temperature=0.5):
    """SimCLR contrastive loss for a batch of 2N views (N positive pairs).
    Rows 2k and 2k+1 are two augmentations of the same image."""
    z = F.normalize(z, dim=1)                 # cosine similarity via dot product
    sim = z @ z.t() / temperature             # [2N, 2N] pairwise similarities
    n = z.size(0)
    sim.fill_diagonal_(float("-inf"))         # an image is not its own negative

    # Positive of row i is its paired view (i XOR 1).
    targets = torch.arange(n, device=z.device) ^ 1
    return F.cross_entropy(sim, targets)      # pick the true positive out of the batch

# Two augmented views of 4 images -> 8 embeddings.
z = torch.randn(8, 128)
print("Contrastive loss:", round(nt_xent(z).item(), 3))
# No labels anywhere: the 'classes' are just 'which image did this view come from?'.`,
  tldr: [
    "**Self-supervised pretraining** learns visual features from unlabeled images by inventing a **pretext task**; labels are only needed later for a small fine-tuning/probe step.",
    "**Contrastive** methods (SimCLR) pull together two augmentations of the *same* image and push apart other images — positives/negatives come from augmentation, not labels.",
    "**Masked image modeling** (MAE) hides ~75% of patches and reconstructs them from the visible ones — masked-language modeling for vision, and cheap because the encoder only sees visible patches.",
    "**Self-distillation** (DINO, BYOL) trains a student to match an EMA teacher with no negatives, using anti-collapse tricks (centering, stop-gradient).",
    "The goal is the **representation**, not the pretext output — evaluate it with a **linear probe** (freeze encoder) or by **fine-tuning**.",
    "Watch for **representation collapse** (everything maps to one vector) and **augmentation mismatch** (the invariances you teach must suit the downstream task).",
  ],
  additionalSections: [
    {
      heading: "Derivation: How Contrastive Learning Manufactures Supervision",
      content: `
The puzzle of SSL is where the training signal comes from without labels. Contrastive learning's answer is elegant: **the label is "which image did this view come from?"**, and that is free.

Take one image $x$ and apply two independent random augmentations (random crop, color jitter, blur) to get views $x^{(1)}, x^{(2)}$. Encode them to embeddings $z_i, z_j$. By construction these are a **positive pair** — different pixels, same underlying content — and every other image in the batch provides **negatives**. The NT-Xent loss is exactly a softmax classification where the "classes" are batch members and the correct answer is the positive:

$$ \\mathcal{L}_{i,j} = -\\log \\frac{\\exp(\\text{sim}(z_i,z_j)/\\tau)}{\\sum_{k\\ne i}\\exp(\\text{sim}(z_i,z_k)/\\tau)}. $$

Minimizing the negative log-likelihood pushes $\\text{sim}(z_i, z_j)$ up and all $\\text{sim}(z_i, z_k)$ down. For the encoder to succeed, it must map the two augmented views close together while keeping them distinguishable from other images — which forces it to **discard the nuisance factors the augmentations vary** (position, color, scale) and **keep the semantic content** that identifies the image. The augmentation pipeline therefore *defines* the invariances learned: this is the lever and the risk. The temperature $\\tau$ controls how sharply the softmax penalizes the hardest negatives — small $\\tau$ focuses on the most confusable images. Methods like MoCo extend this with a large queue of negatives via a momentum encoder, and non-contrastive methods (BYOL, DINO) remove explicit negatives but must then add machinery to prevent the trivial constant-embedding solution. The deep point: a careful choice of *which pairs are "the same"* turns an unlabeled dataset into a fully-supervised classification problem the model can learn from.
      `,
    },
  ],
  comparisons: [
    {
      title: "Contrastive vs Masked Modeling vs Self-Distillation",
      methods: ["Contrastive (SimCLR)", "Masked Modeling (MAE)", "Self-Distillation (DINO)"],
      rows: [
        {
          dimension: "Pretext task",
          values: [
            "Match two augmented views",
            "Reconstruct masked patches",
            "Match an EMA teacher's output",
          ],
        },
        {
          dimension: "Needs negatives?",
          values: ["Yes", "No", "No"],
        },
        {
          dimension: "Relies on heavy augmentation?",
          values: ["Strongly", "Lightly (masking is the signal)", "Strongly (multi-crop)"],
        },
        {
          dimension: "Collapse risk",
          values: [
            "Low — negatives prevent it",
            "Low — reconstruction target",
            "High — needs centering/stop-grad",
          ],
        },
        {
          dimension: "Notable strength",
          values: [
            "Strong linear-probe features",
            "Scales cheaply, great fine-tuning",
            "Emergent object segmentation",
          ],
        },
      ],
      takeaway:
        "Contrastive learning leans on augmentation and negatives; masked modeling makes the signal the missing pixels and scales cheaply; self-distillation drops negatives but must actively prevent collapse. All three yield strong transferable encoders.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You have **lots of unlabeled images** but few labels — pretrain self-supervised, then fine-tune on the small labeled set.",
      "You want a **general-purpose backbone** to transfer across several downstream vision tasks.",
      "Labeling is expensive or slow (medical, satellite, industrial) and unlabeled data is plentiful.",
      "You are building a **vision foundation model** intended to be adapted many times.",
    ],
    avoidWhen: [
      "You already have abundant labels for your exact task — plain supervised training may be simpler and as good.",
      "You lack the compute/data scale for pretraining to pay off, and a pretrained off-the-shelf encoder already exists.",
      "Your downstream task depends on a factor your planned augmentations would make the model invariant to (e.g. color).",
      "You need results immediately and cannot afford a separate pretraining stage — start from public pretrained weights instead.",
    ],
    rulesOfThumb: [
      "Evaluate the encoder with a linear probe first; fine-tune only if the frozen features are close.",
      "Choose augmentations/mask ratio to match what *should* be invariant for your task.",
      "For non-contrastive methods, include an explicit anti-collapse mechanism (EMA teacher + centering, stop-gradient).",
    ],
  },
  caseStudies: [
    {
      title: "Masked autoencoders make label-free pretraining scalable",
      domain: "Self-supervised representation learning",
      scenario:
        "Contrastive methods had shown self-supervision could rival supervised pretraining, but they leaned on carefully tuned augmentations and large batches of negatives. The open question was whether a simple, scalable reconstruction objective — like masked-language modeling in NLP — could work for images, where pixels are redundant and a low mask ratio makes the task trivial.",
      approach:
        "He et al.'s MAE masks a *high* fraction of patches (~75%), passes only the visible 25% through a ViT encoder, and uses a lightweight decoder to reconstruct the missing patches' pixels with an MSE loss. The aggressive masking makes the task non-trivial and, because the encoder ignores masked patches, cuts pretraining compute several-fold.",
      outcome:
        "A ViT-Huge pretrained with MAE and then fine-tuned reached **87.8% top-1 accuracy on ImageNet-1K** using only ImageNet data, surpassing supervised-from-scratch training, while pretraining ran roughly **3× faster** than processing full images. MAE became a default scalable recipe for vision pretraining and a template for masked modeling beyond images.",
      source: {
        title: "Masked Autoencoders Are Scalable Vision Learners",
        authors: "He, K., Chen, X., Xie, S., Li, Y., Dollár, P. and Girshick, R.",
        url: "https://arxiv.org/abs/2111.06377",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "In contrastive self-supervised learning, where does a positive pair come from?",
      options: [
        {
          text: "Two different random augmentations of the same image.",
          correct: true,
        },
        {
          text: "Two images that share a human-assigned class label.",
          correct: false,
        },
        {
          text: "An image and its caption.",
          correct: false,
        },
        {
          text: "Two adjacent frames hand-labeled as identical.",
          correct: false,
        },
      ],
      explanation:
        "Positives are two augmented views (crop, color jitter, blur) of the *same* image; negatives are other images in the batch. No labels are used — the supervision is manufactured from the data and the augmentation pipeline, which is what makes the method self-supervised.",
    },
    {
      question:
        "Why does MAE mask such a large fraction of patches (~75%)?",
      options: [
        {
          text: "A low mask ratio makes reconstruction trivial (pixels are redundant); high masking forces real understanding and, since the encoder skips masked patches, makes pretraining much cheaper.",
          correct: true,
        },
        {
          text: "To reduce the image resolution permanently.",
          correct: false,
        },
        {
          text: "Because the decoder can only handle a few patches.",
          correct: false,
        },
        {
          text: "To add label noise for regularization.",
          correct: false,
        },
      ],
      explanation:
        "Images are spatially redundant, so reconstructing a few masked patches from many visible ones is too easy. Masking ~75% makes the task demand semantic understanding, and because MAE's encoder processes only the visible 25%, pretraining is several times faster than full-image processing.",
    },
    {
      question:
        "What is the goal of self-supervised pretraining, and how is it evaluated?",
      options: [
        {
          text: "A transferable representation — evaluated by a linear probe on frozen features or by fine-tuning, not by the pretext loss itself.",
          correct: true,
        },
        {
          text: "Perfect reconstruction of the pretext task, which is the deliverable.",
          correct: false,
        },
        {
          text: "Minimizing the contrastive loss to exactly zero.",
          correct: false,
        },
        {
          text: "Producing labeled data automatically.",
          correct: false,
        },
      ],
      explanation:
        "The pretext task (contrast, reconstruct, distill) is only a scaffold; the deliverable is a good encoder. Quality is measured downstream — a linear probe freezes the encoder and trains only a linear classifier (testing feature quality), or the encoder is fine-tuned on the target task.",
    },
    {
      question:
        "What is 'representation collapse' and which methods are most at risk?",
      options: [
        {
          text: "The encoder maps every input to (nearly) the same vector — a trivial low-loss solution; non-contrastive self-distillation methods are most at risk without anti-collapse tricks.",
          correct: true,
        },
        {
          text: "The model runs out of memory on large images.",
          correct: false,
        },
        {
          text: "The learning rate decays to zero too early.",
          correct: false,
        },
        {
          text: "The dataset becomes too small after augmentation.",
          correct: false,
        },
      ],
      explanation:
        "Collapse is when all images map to a constant embedding: the loss looks low but features are useless. Contrastive methods avoid it via negatives; non-contrastive self-distillation methods (BYOL, DINO) need explicit safeguards — an EMA teacher, output centering/sharpening, and stop-gradient — to prevent it.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain how self-supervised learning obtains a training signal without labels, using contrastive learning and masked image modeling as examples, and how you would evaluate the result.",
      expectedAnswerRubric:
        "A strong answer should explain that SSL invents a pretext task whose targets are derived from the data itself. For contrastive learning: two random augmentations of the same image form a positive pair and other images are negatives, with an InfoNCE/NT-Xent softmax pulling positives together and pushing negatives apart, forcing the encoder to keep semantic content and discard augmentation nuisances (so the augmentation choice defines the learned invariances). For masked image modeling (MAE): a large fraction (~75%) of patches is hidden and the network reconstructs them from the visible ones via MSE, forcing it to model objects/parts/context, and the encoder seeing only visible patches makes it cheap. It should note the goal is the representation, evaluated by a frozen-encoder linear probe (feature quality) or by fine-tuning, not by the pretext loss; bonus for mentioning collapse risk in non-contrastive methods.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
