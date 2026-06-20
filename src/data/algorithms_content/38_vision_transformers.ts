import { LearningModule } from "./types";

export const visionTransformers: LearningModule = {
  id: "vision-transformers",
  title: "Vision Transformers (ViT)",
  category: "Computer Vision",
  prerequisites: ["transformers", "computer-vision"],
  tracks: ["computer-vision"],
  difficulty: 4,
  relatedModules: ["transformers", "cnn", "computer-vision", "image-segmentation"],
  shortDescription:
    "Apply the standard Transformer encoder directly to images by splitting the picture into a sequence of patches — trading the convolution's built-in locality for global, content-based attention that, with enough data, matches or beats CNNs.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Explain how an image becomes a sequence of tokens via patch embedding, position embeddings, and a prepended [CLS] token",
    "Contrast the inductive biases of CNNs (locality, translation equivariance) with the Vision Transformer's near-absence of them, and why that makes ViT data-hungry",
    "Describe why self-attention gives every patch a global receptive field from the very first layer, unlike a convolution",
    "Connect the patch-token idea to downstream vision systems — DETR for detection and CLIP for image–text alignment",
  ],
  keyTerms: [
    {
      term: "Patch Embedding",
      definition:
        "Splitting an image into fixed-size, non-overlapping patches, flattening each, and linearly projecting it to a D-dimensional token — the vision analogue of a word embedding.",
    },
    {
      term: "[CLS] Token",
      definition:
        "A learnable token prepended to the patch sequence whose final-layer representation is used as the image's summary for classification, mirroring BERT's classification token.",
    },
    {
      term: "Inductive Bias",
      definition:
        "Assumptions baked into an architecture. Convolutions assume locality and translation equivariance; a pure Transformer assumes almost nothing, so it must learn spatial structure from data.",
    },
    {
      term: "Position Embedding",
      definition:
        "A learned vector added to each patch token to encode where it sits in the image, since self-attention is otherwise permutation-invariant and would ignore patch order.",
    },
  ],
  misconceptions: [
    {
      claim:
        "A Vision Transformer runs self-attention over individual pixels.",
      correction:
        "Pixel-level attention would cost $O((HW)^2)$ and is infeasible for real images. ViT first groups pixels into patches (e.g. 16×16) and attends over the few hundred resulting patch tokens, not the tens of thousands of pixels.",
    },
    {
      claim:
        "Vision Transformers are simply better than CNNs, so CNNs are obsolete.",
      correction:
        "ViT only matches or beats CNNs when pre-trained on very large datasets. With limited data, a CNN's locality and translation-equivariance biases win decisively. Distillation (DeiT), convolutional stems, and hybrid models exist precisely to give ViTs some of that bias back.",
    },
    {
      claim:
        "Self-attention is translation equivariant, just like a convolution.",
      correction:
        "Adding (typically learned) position embeddings breaks permutation/translation invariance on purpose so the model can reason about location. ViT therefore does not inherit the convolution's translation equivariance; it must learn any such regularity from data.",
    },
  ],
  references: [
    {
      title:
        "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
      authors:
        "Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., et al.",
      url: "https://arxiv.org/abs/2010.11929",
      type: "paper",
    },
    {
      title: "End-to-End Object Detection with Transformers (DETR)",
      authors: "Carion, N., Massa, F., Synnaeve, G., Usunier, N., et al.",
      url: "https://arxiv.org/abs/2005.12872",
      type: "paper",
    },
    {
      title: "Learning Transferable Visual Models From Natural Language Supervision (CLIP)",
      authors: "Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., et al.",
      url: "https://arxiv.org/abs/2103.00020",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Data starvation when trained from scratch",
      description:
        "Because it lacks the convolution's locality and translation-equivariance priors, a ViT trained on a small dataset (e.g. ImageNet-1k alone, no pre-training) underfits the useful structure and is beaten by a comparable ResNet.",
      mitigation:
        "Pre-train on a large corpus (ImageNet-21k or JFT-300M) and fine-tune, use strong augmentation plus distillation from a CNN teacher (DeiT), or add a convolutional stem / hybrid backbone to inject locality.",
    },
    {
      name: "Quadratic attention cost at high resolution",
      description:
        "Self-attention is $O(N^2)$ in the number of patches, so halving the patch size (4× the tokens) raises attention cost roughly 16×. Dense, high-resolution images explode the sequence length.",
      mitigation:
        "Use larger patches, or a hierarchical / windowed-attention design (Swin) that restricts attention to local windows and merges patches across stages to keep cost near-linear.",
    },
  ],
  fullDescription: `
The Vision Transformer (ViT) asks a deliberately blunt question: what if we drop the convolution entirely and feed an image to the *same* Transformer encoder used for language? The answer, from the 2020 ViT paper, is that it works remarkably well — provided you train on enough data.

The recipe is short:

1. **Patchify.** Cut the image into a grid of fixed-size, non-overlapping patches (commonly 16×16 pixels). A 224×224 image becomes a 14×14 grid of 196 patches.
2. **Embed.** Flatten each patch and linearly project it to a $D$-dimensional vector — a *patch embedding*, the visual counterpart of a word embedding.
3. **Add position + [CLS].** Prepend a learnable [CLS] token and add learned position embeddings so the model knows where each patch sits.
4. **Encode.** Run the sequence through a standard Transformer encoder (multi-head self-attention + MLP blocks).
5. **Read out.** Feed the final [CLS] representation to a small classification head.

### Why this matters
A convolution hard-codes two assumptions: nearby pixels matter most (*locality*) and a feature detector should behave the same everywhere (*translation equivariance*). These priors make CNNs superb when data is scarce. ViT throws them away and instead lets **global, content-based attention** decide which patches should talk to each other — from the very first layer. That flexibility is a liability with little data and an advantage at scale, and the patch-token formulation has become the substrate for detection (DETR), open-vocabulary recognition (CLIP), and segmentation (SAM, Mask2Former).
  `,
  intuition: `
A CNN reads an image like someone studying it through a small magnifying glass: it can only see a little neighborhood at a time and slides the glass around, slowly building up context layer by layer. Locality is wired in — distant corners of the image cannot directly influence each other until many layers deep.

A Vision Transformer instead chops the picture into a deck of cards (the patches), lays them all on the table, and lets every card look at every other card at once. A patch showing a wheel can immediately attend to a patch showing a car door on the opposite side of the image and conclude "vehicle", with no notion that they happen to be near or far. Nothing tells it that adjacent patches are special — it must *learn* that from examples. Give it few examples and it flails; give it hundreds of millions and it discovers spatial structure on its own, plus long-range relationships a small magnifying glass would take many layers to assemble.
  `,
  mathematics: `
### 1. Image to token sequence
Split an $H\\times W$ image with $C$ channels into patches of size $P\\times P$. The number of patches (the sequence length) is

$$ N = \\frac{H\\,W}{P^2}. $$

Each patch $x_p^{(i)} \\in \\mathbb{R}^{P^2 C}$ is flattened and projected by a shared matrix $E \\in \\mathbb{R}^{(P^2 C)\\times D}$. With a learnable class token $x_{\\text{cls}}$ and position embeddings $E_{\\text{pos}}$, the input to the encoder is

$$ z_0 = [\\,x_{\\text{cls}};\\; x_p^{(1)}E;\\; x_p^{(2)}E;\\; \\dots;\\; x_p^{(N)}E\\,] + E_{\\text{pos}}. $$

### 2. Self-attention over patches
Each encoder layer applies multi-head self-attention. For queries $Q$, keys $K$, and values $V$ (linear projections of the tokens, with key dimension $d_k$):

$$ \\text{Attention}(Q,K,V) = \\text{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V. $$

Because every query attends to every key, a single layer's **receptive field is the whole image** — there is no locality constraint to grow through depth.

### 3. The cost of going finer
Attention scales quadratically with sequence length, $O(N^2 D)$. Since $N = HW/P^2$, halving the patch size $P$ multiplies $N$ by 4 and the attention cost by roughly 16 — the central reason ViTs use coarse patches and hierarchical variants window the attention.
  `,
  pros: [
    "Global receptive field from the first layer: any patch can directly attend to any other, capturing long-range relationships a CNN reaches only after many layers.",
    "Scales smoothly with data and model size — given large-scale pre-training, ViTs match or surpass the best CNNs at lower pre-training compute.",
    "Reuses the exact Transformer stack from language, so vision and text can share one architecture and even one embedding space (CLIP), enabling powerful multimodal systems.",
  ],
  cons: [
    "Data-hungry: without large-scale pre-training or distillation, a from-scratch ViT is beaten by a comparable CNN because it lacks locality and translation-equivariance priors.",
    "Self-attention is quadratic in patch count, so high-resolution or dense-prediction use cases need windowed/hierarchical attention to stay affordable.",
    "Less interpretable spatially than convolutions and sensitive to patch size and position-embedding choices, which interact with input resolution.",
  ],
  codeSnippet: `import torch
import torch.nn as nn

class PatchEmbed(nn.Module):
    """Turn an image into a sequence of patch tokens (the heart of ViT)."""
    def __init__(self, img=224, patch=16, in_ch=3, dim=768):
        super().__init__()
        self.n_patches = (img // patch) ** 2          # 224/16 = 14 -> 196 patches
        # A stride-patch conv is an efficient way to flatten + project each patch.
        self.proj = nn.Conv2d(in_ch, dim, kernel_size=patch, stride=patch)
        self.cls = nn.Parameter(torch.zeros(1, 1, dim))
        self.pos = nn.Parameter(torch.zeros(1, self.n_patches + 1, dim))

    def forward(self, x):                              # x: [B, 3, 224, 224]
        x = self.proj(x)                               # [B, 768, 14, 14]
        x = x.flatten(2).transpose(1, 2)               # [B, 196, 768] patch tokens
        cls = self.cls.expand(x.size(0), -1, -1)       # [B, 1, 768]
        x = torch.cat([cls, x], dim=1) + self.pos      # [B, 197, 768] (+CLS, +pos)
        return x

tokens = PatchEmbed()(torch.rand(2, 3, 224, 224))
print("Sequence shape:", tuple(tokens.shape))          # (2, 197, 768)
# Feed 'tokens' to a standard nn.TransformerEncoder; read out tokens[:, 0] (the CLS).`,
  tldr: [
    "A **Vision Transformer** feeds an image to the standard Transformer encoder by first cutting it into **patches** and treating each as a token.",
    "Pipeline: **patchify → linear patch embedding → add position embeddings + a [CLS] token → Transformer encoder → classify from the final [CLS]**.",
    "Self-attention gives every patch a **global receptive field in layer 1**, unlike a convolution whose receptive field grows slowly with depth.",
    "ViT discards the CNN's **locality and translation-equivariance inductive biases**, so it is **data-hungry**: it needs large-scale pre-training (or distillation) to beat CNNs, and loses to them on small datasets.",
    "Cost is **quadratic in patch count** ($N = HW/P^2$), which is why patches are coarse and hierarchical/windowed variants (Swin) exist.",
    "The patch-token formulation underpins modern vision: **DETR** (detection as set prediction) and **CLIP** (contrastive image–text alignment for zero-shot recognition).",
  ],
  additionalSections: [
    {
      heading: "Derivation: Why a Pure Transformer Needs Hundreds of Millions of Images",
      content: `
The gap between ViT and CNNs is best understood through **inductive bias** — the assumptions an architecture makes *before* seeing any data.

**What a convolution assumes for free.** A conv layer with a $3\\times3$ kernel can only mix a pixel with its eight neighbors (*locality*), and it slides the *same* kernel across every position (*translation equivariance*). These two priors are not learned — they are structural. They encode a true fact about natural images (a cat is a cat wherever it appears, and nearby pixels are highly correlated), so a CNN does not have to spend data discovering it. This is why CNNs train well on tens of thousands of images.

**What ViT assumes instead.** A pure Transformer's self-attention is, before position embeddings, *permutation invariant*: shuffle the patches and the computation is unchanged. It has **no built-in notion of locality and no translation equivariance**. The only spatial prior is whatever the learned position embeddings discover. So the model must learn, from scratch and from data alone, facts a CNN gets for free — including that adjacent patches tend to be related.

**The empirical consequence.** The ViT paper makes the trade-off concrete. Pre-trained only on ImageNet-1k (~1.3M images), ViT *underperforms* a comparable ResNet. Pre-trained on ImageNet-21k (~14M) it pulls level. Pre-trained on the in-house JFT-300M (~300M images) it *overtakes* the best CNNs. The lesson is a general one in deep learning: **more inductive bias helps in the small-data regime; more flexibility (and less bias) helps once data is abundant**, because the flexible model can learn better-than-hand-designed structure. Distillation (DeiT), convolutional stems, and hybrid backbones are all ways to lend a ViT some convolutional bias so it needs less data.
      `,
    },
    {
      heading: "From Patch Tokens to DETR and CLIP",
      content: `
Once an image is a *sequence of tokens*, the whole Transformer toolbox becomes available — and two systems show how far the idea reaches.

**DETR — detection as set prediction.** Classical detectors emit thousands of anchor boxes and rely on hand-tuned non-maximum suppression to dedupe them. DETR replaces this with a Transformer encoder–decoder over image features and a fixed set of learned *object queries*; each query directly predicts one box-and-class (or "no object"). Training uses a **bipartite matching loss**: the Hungarian algorithm finds the one-to-one assignment between predictions and ground-truth objects that minimizes total cost, and the loss is applied to that matching. The result is a fully end-to-end detector with **no anchors and no NMS** — a direct consequence of treating detection as predicting a *set* of tokens.

**CLIP — aligning images and text.** CLIP trains an image encoder (often a ViT) and a text encoder *jointly* so that an image and its caption land near each other in a shared embedding space. Given a batch of $N$ (image, text) pairs, it forms the $N\\times N$ similarity matrix and applies a **contrastive (InfoNCE) loss**: the $N$ correct pairs on the diagonal should score high, the $N^2 - N$ mismatched pairs low. After training on hundreds of millions of web pairs, CLIP classifies **zero-shot** — to recognize a new category you simply embed the prompt "a photo of a {label}" and pick the nearest image embedding, no fine-tuning required. Both systems rest on the same foundation as ViT: represent the image as tokens and let attention do the relational reasoning.
      `,
    },
  ],
  comparisons: [
    {
      title: "Vision Transformer vs Convolutional Neural Network",
      methods: ["Vision Transformer (ViT)", "CNN"],
      rows: [
        {
          dimension: "Built-in inductive bias",
          values: [
            "Almost none — must learn spatial structure from data",
            "Locality + translation equivariance hard-coded",
          ],
        },
        {
          dimension: "Receptive field in layer 1",
          values: [
            "Global — every patch attends to every patch",
            "Local — limited to the kernel's neighborhood",
          ],
        },
        {
          dimension: "Data efficiency",
          values: [
            "Low — needs large-scale pre-training or distillation",
            "High — trains well on modest datasets",
          ],
        },
        {
          dimension: "Compute scaling with input size",
          values: [
            "Quadratic in patch count ($O(N^2)$)",
            "Roughly linear in pixels",
          ],
        },
        {
          dimension: "Where it shines",
          values: [
            "Large data, multimodal (CLIP), long-range relations",
            "Small/medium data, edge/real-time, dense local features",
          ],
        },
      ],
      takeaway:
        "ViT trades the convolution's hand-coded priors for flexibility: that costs data but pays off at scale and unlocks a shared architecture for vision and language. Hybrids (conv stem + attention) try to get both.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You have access to a **large pre-trained backbone** (or can pre-train at scale) and want state-of-the-art transfer performance.",
      "The task needs **long-range or global reasoning** across the image that a small-kernel CNN reaches only deep in the stack.",
      "You want a **multimodal** system — e.g. image–text retrieval, zero-shot classification, or captioning — where sharing the Transformer/embedding space with text is valuable (CLIP-style).",
      "You are building modern **detection or segmentation** heads (DETR, Mask2Former, SAM) that assume a token/attention backbone.",
    ],
    avoidWhen: [
      "You must train **from scratch on a small dataset** with no pre-training — a CNN's inductive biases will usually win.",
      "You face **tight real-time or low-power** constraints at high resolution, where quadratic attention is too costly relative to an efficient CNN.",
      "Your problem is dominated by **local texture** with little long-range structure, where convolutions are already a near-perfect fit.",
      "You lack the engineering budget for the heavy augmentation/regularization schedules ViTs typically need to train stably.",
    ],
    rulesOfThumb: [
      "Default to fine-tuning a pre-trained ViT rather than training one from scratch.",
      "If data is limited and you still want attention, reach for a distilled (DeiT) or hybrid/windowed (Swin) variant.",
      "Pick patch size to balance accuracy and cost: smaller patches = more tokens = more accuracy but quadratically more compute.",
    ],
  },
  caseStudies: [
    {
      title: "ViT overtakes CNNs on ImageNet — but only after pre-training on 300M images",
      domain: "Image classification",
      scenario:
        "By 2020, convolutional networks had defined image recognition for nearly a decade. The ViT authors wanted to know whether a near-pure Transformer, stripped of convolutional priors, could compete — and crucially, how that answer depends on the amount of pre-training data.",
      approach:
        "They trained the same ViT architecture under three pre-training regimes — ImageNet-1k (~1.3M images), ImageNet-21k (~14M), and the in-house JFT-300M (~300M) — then fine-tuned and compared against strong ResNet-based Big Transfer (BiT) baselines, holding the transfer protocol fixed.",
      outcome:
        "The data dependence was stark. Pre-trained only on ImageNet-1k, ViT **underperformed** comparable ResNets; on ImageNet-21k it drew level; pre-trained on JFT-300M, **ViT-H/14 reached 88.55% ImageNet top-1**, beating the best BiT CNN while using substantially **less pre-training compute**. The experiment crystallized the rule that flexible, low-bias models overtake hand-biased ones once data is abundant.",
      source: {
        title:
          "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
        authors:
          "Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., et al.",
        url: "https://arxiv.org/abs/2010.11929",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "A ViT processes a 224×224 image with 16×16 patches. How many tokens enter the Transformer encoder?",
      options: [
        { text: "197 — 196 patch tokens plus one [CLS] token.", correct: true },
        { text: "196 — one token per patch, no extra tokens.", correct: false },
        { text: "224 — one token per pixel row.", correct: false },
        { text: "50,176 — one token per pixel.", correct: false },
      ],
      explanation:
        "The patch grid is $224/16 = 14$ per side, so $14\\times14 = 196$ patch tokens. ViT prepends a learnable [CLS] token, giving $196 + 1 = 197$. Attention is over patches, not pixels — pixel-level attention would be quadratic in 50,176 tokens and infeasible.",
    },
    {
      question:
        "Why does a Vision Transformer typically need far more training data than a comparable CNN?",
      options: [
        {
          text: "It lacks the CNN's built-in locality and translation-equivariance biases, so it must learn spatial structure from data.",
          correct: true,
        },
        {
          text: "Its self-attention has far more parameters per layer than any convolution.",
          correct: false,
        },
        {
          text: "Images must be upscaled before patchifying, inflating the dataset size needed.",
          correct: false,
        },
        {
          text: "Transformers cannot use data augmentation, so they need more raw images.",
          correct: false,
        },
      ],
      explanation:
        "A convolution hard-codes locality and translation equivariance — priors that match natural images and save data. A pure Transformer assumes almost nothing and must learn that structure from examples, so it only matches or beats CNNs after large-scale pre-training (or distillation).",
    },
    {
      question:
        "What is the receptive field of a single self-attention layer in a ViT?",
      options: [
        {
          text: "Global — every patch can attend to every other patch in that one layer.",
          correct: true,
        },
        {
          text: "A 3×3 neighborhood of patches, like a convolution.",
          correct: false,
        },
        {
          text: "Only the [CLS] token; patches cannot see each other.",
          correct: false,
        },
        {
          text: "It depends on depth — the field grows one patch per layer.",
          correct: false,
        },
      ],
      explanation:
        "Self-attention computes interactions between all query–key pairs, so each patch attends to the entire sequence in a single layer — a global receptive field from layer 1. A convolution, by contrast, must stack many layers before distant pixels can interact.",
    },
    {
      question:
        "What role does the [CLS] token play in a ViT classifier?",
      options: [
        {
          text: "Its final-layer representation aggregates information from all patches and is fed to the classification head.",
          correct: true,
        },
        {
          text: "It stores the position of each patch in the image.",
          correct: false,
        },
        {
          text: "It is the patch with the highest attention weight.",
          correct: false,
        },
        {
          text: "It marks the boundary between the image and the text in multimodal models.",
          correct: false,
        },
      ],
      explanation:
        "Borrowed from BERT, the learnable [CLS] token is prepended to the patch sequence; through self-attention it pools evidence from every patch, and its output state serves as the image summary passed to the classification head. Position information instead comes from the separate position embeddings.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain the inductive-bias trade-off between a CNN and a Vision Transformer, and how it predicts which model wins in the small-data versus large-data regimes.",
      expectedAnswerRubric:
        "The answer should state that a CNN hard-codes locality and translation equivariance, which are useful priors matching natural images and therefore save data, while a pure ViT has almost no spatial inductive bias (self-attention is permutation-invariant aside from learned position embeddings) and must learn spatial structure from data. It should conclude that with little data the CNN's biases win, but with very large-scale pre-training the more flexible ViT learns better-than-hand-designed structure and matches or surpasses CNNs. A strong answer cites the ViT result that ImageNet-1k pre-training underperforms ResNets while JFT-300M pre-training overtakes them, and may mention distillation/hybrid stems as ways to add bias back.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
