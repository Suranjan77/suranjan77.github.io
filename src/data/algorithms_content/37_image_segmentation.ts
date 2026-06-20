import { LearningModule } from "./types";

export const imageSegmentation: LearningModule = {
  id: "image-segmentation",
  title: "Image Segmentation",
  category: "Computer Vision",
  prerequisites: ["cnn", "computer-vision"],
  tracks: ["computer-vision"],
  difficulty: 3,
  relatedModules: ["computer-vision", "cnn", "autoencoders"],
  shortDescription:
    "Dense, per-pixel prediction that assigns every pixel in an image to a class — the most spatially detailed level of visual understanding, scored by how well predicted masks overlap the ground truth.",
  estimatedMinutes: 30,
  learningObjectives: [
    "Distinguish semantic, instance, and panoptic segmentation by what each output represents",
    "Explain why segmentation uses a per-pixel loss and how encoder–decoder (U-Net) architectures recover spatial resolution",
    "Compute and contrast the Dice coefficient and Intersection over Union (IoU) from true/false positives and negatives",
    "Choose an appropriate loss (pixel-wise cross-entropy vs Dice/focal) for class-imbalanced segmentation problems",
  ],
  keyTerms: [
    {
      term: "Semantic Segmentation",
      definition:
        "Assigning a class label to every pixel, with all pixels of a class merged into one region (e.g. all 'car' pixels look identical).",
    },
    {
      term: "Instance Segmentation",
      definition:
        "Per-pixel labeling that also separates individual object instances of the same class (car #1 vs car #2).",
    },
    {
      term: "Dice Coefficient",
      definition:
        "An overlap metric, 2·|A∩B| / (|A|+|B|), equal to the harmonic-mean-style agreement between a predicted mask and the ground truth; widely used as a loss for imbalanced masks.",
    },
    {
      term: "Transposed Convolution",
      definition:
        "A learnable upsampling operation that increases spatial resolution, used in a decoder to turn coarse feature maps back into a full-resolution mask.",
    },
  ],
  misconceptions: [
    {
      claim:
        "Semantic segmentation can count how many separate objects of a class are present.",
      correction:
        "Semantic segmentation merges all pixels of a class into one region, so it cannot tell two touching cars apart. Counting separate instances requires instance (or panoptic) segmentation.",
    },
    {
      claim:
        "Segmentation is just image classification run independently on each pixel.",
      correction:
        "A pixel's label depends on its spatial context (neighbors, object shape, scene layout). Segmentation networks use large receptive fields and encoder–decoder structure with skip connections to combine global context with local detail — far more than per-pixel classification in isolation.",
    },
  ],
  references: [
    {
      title: "U-Net: Convolutional Networks for Biomedical Image Segmentation",
      authors: "Ronneberger, O., Fischer, P. and Brox, T.",
      url: "https://arxiv.org/abs/1505.04597",
      type: "paper",
    },
    {
      title: "Fully Convolutional Networks for Semantic Segmentation",
      authors: "Long, J., Shelhamer, E. and Darrell, T.",
      url: "https://arxiv.org/abs/1411.4038",
      type: "paper",
    },
    {
      title: "Mask R-CNN",
      authors: "He, K., Gkioxari, G., Dollár, P. and Girshick, R.",
      url: "https://arxiv.org/abs/1703.06870",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Class imbalance washes out small structures",
      description:
        "When the object of interest occupies a tiny fraction of pixels (e.g. a lesion in a scan), plain pixel-wise cross-entropy is dominated by the background class, and the model can score high 'accuracy' while missing the object entirely.",
      mitigation:
        "Use overlap-based losses (Dice, Tversky) or focal loss that down-weight the easy background, and report Dice/IoU rather than pixel accuracy.",
    },
    {
      name: "Blurry, blobby boundaries",
      description:
        "Aggressive downsampling in the encoder discards fine spatial detail, so naive decoders produce masks with smeared, imprecise edges.",
      mitigation:
        "Add skip connections (U-Net) to fuse high-resolution encoder features into the decoder, and consider boundary-aware losses or dilated/atrous convolutions that keep resolution high.",
    },
  ],
  fullDescription: `
Image segmentation is the most spatially detailed task in computer vision: instead of one label per image (classification) or a box per object (detection), it predicts a class label for **every pixel**. The output is a *mask* the same height and width as the input.

There are three common flavors, in increasing richness:

1. **Semantic segmentation** — every pixel gets a class, but all instances of a class are merged (all "road" pixels are one region).
2. **Instance segmentation** — every pixel of every *object* instance is labeled separately (car #1's mask is distinct from car #2's), but "stuff" classes like sky or road are usually ignored.
3. **Panoptic segmentation** — unifies the two: every pixel gets both a class and, for countable "things", an instance id.

### Where is it used?
Segmentation powers medical imaging (delineating tumors and organs), autonomous driving (free-space and lane estimation), satellite and aerial mapping (land-use classification), photo editing (background removal, "portrait mode"), and robotics (graspable-region detection). Anywhere a system needs the *exact shape* of things, not just their presence or rough location, segmentation is the tool.
  `,
  intuition: `
Think of handing an artist a photo and three different instructions.

"Tell me what's in it" — they shout "a street scene!" (classification). "Box the cars" — they draw rectangles (detection). "Color it in by hand" — they take colored pencils and shade every pixel: road grey, cars blue, people red, sky pale (semantic segmentation). If you further ask them to give *each car its own shade of blue*, that's instance segmentation.

The catch: to color in the picture well, the artist must reason about both the big picture (where the road is) and the fine detail (the exact silhouette of each car). Segmentation networks mirror this — a "contracting" path that zooms out to understand context, and an "expanding" path that zooms back in to draw crisp boundaries.
  `,
  mathematics: `
### 1. Per-Pixel Cross-Entropy
A segmentation network outputs, for each pixel $i$ and each of $K$ classes, a probability $\\hat{p}_{i,k}$ (a softmax over the class channels). With one-hot ground truth $y_{i,k}$, the loss is the average cross-entropy **over all pixels**:

$$ \\mathcal{L}_{CE} = -\\frac{1}{N}\\sum_{i=1}^{N}\\sum_{k=1}^{K} y_{i,k}\\,\\log \\hat{p}_{i,k} $$

This is just image classification applied $N$ times — once per pixel — sharing one network.

### 2. Dice Coefficient and IoU
To grade a predicted binary mask $P$ against ground truth $G$, we measure overlap. With true positives $TP=|P\\cap G|$, false positives $FP$, and false negatives $FN$:

$$ \\text{Dice} = \\frac{2|P\\cap G|}{|P| + |G|} = \\frac{2\\,TP}{2\\,TP + FP + FN}, \\qquad \\text{IoU} = \\frac{|P\\cap G|}{|P\\cup G|} = \\frac{TP}{TP + FP + FN} $$

The two are monotonically related ($\\text{Dice} = \\tfrac{2\\,\\text{IoU}}{1+\\text{IoU}}$), so Dice is always $\\ge$ IoU. Both ignore the (usually huge) true-negative background, which is exactly why they are preferred over pixel accuracy on imbalanced masks.

### 3. Soft Dice Loss
Because $\\text{argmax}$ is not differentiable, the **soft** Dice loss plugs the predicted probabilities $\\hat{p}_i$ directly into the formula and is minimized during training:

$$ \\mathcal{L}_{Dice} = 1 - \\frac{2\\sum_i \\hat{p}_i\\,g_i + \\epsilon}{\\sum_i \\hat{p}_i + \\sum_i g_i + \\epsilon} $$

where $g_i \\in \\{0,1\\}$ is the ground-truth label and $\\epsilon$ is a small constant for numerical stability when a mask is empty.
  `,
  pros: [
    "Produces exact object shapes and boundaries — the richest spatial output in vision.",
    "Overlap metrics (Dice/IoU) give a principled, imbalance-robust way to measure quality.",
    "Strong pre-trained backbones and architectures (U-Net, DeepLab, Mask R-CNN, SAM) transfer well to new domains with little data.",
  ],
  cons: [
    "Pixel-level annotation is the most expensive labeling there is — every boundary must be traced.",
    "Heavy compute and memory: full-resolution feature maps are large, especially for high-resolution or 3D (volumetric) data.",
    "Sensitive to class imbalance and fuzzy boundaries; needs careful loss design to segment small or thin structures.",
  ],
  codeSnippet: `import torch
from torchvision.models.segmentation import deeplabv3_resnet50

# Pre-trained semantic segmentation model (21 Pascal VOC classes)
model = deeplabv3_resnet50(weights="DEFAULT").eval()

img = torch.rand(1, 3, 256, 256)          # [batch, channels, H, W]

with torch.no_grad():
    logits = model(img)["out"]            # [1, 21, 256, 256] per-pixel class logits

# Hard mask: the argmax class at every pixel
mask = logits.argmax(dim=1)               # [1, 256, 256]
print("Mask shape:", tuple(mask.shape))
print("Classes present:", torch.unique(mask).tolist())

def dice_score(pred, target, eps=1e-6):
    pred, target = pred.float(), target.float()
    inter = (pred * target).sum()
    return ((2 * inter + eps) / (pred.sum() + target.sum() + eps)).item()

# Dice of the 'person' class (id 15) against a stand-in ground truth
person = (mask == 15).float()
print("Dice(person):", dice_score(person, person))   # 1.0 against itself`,
  tldr: [
    "Segmentation predicts a **class for every pixel**, so the output is a mask the same size as the input — the most spatially detailed vision task.",
    "**Semantic** merges all pixels of a class; **instance** separates individual objects; **panoptic** does both.",
    "It is trained with a **per-pixel** loss (pixel-wise cross-entropy) because a single image-level label cannot say *where* an object's boundary is.",
    "Quality is measured by mask overlap — **Dice** $= 2TP/(2TP+FP+FN)$ and **IoU** $= TP/(TP+FP+FN)$ — which ignore the huge background and so survive class imbalance.",
    "**Encoder–decoder** networks (U-Net) downsample for context then upsample for detail, with **skip connections** restoring the sharp boundaries lost during downsampling.",
    "For small or rare structures, swap or augment cross-entropy with **soft Dice / focal loss** so the background doesn't dominate training.",
  ],
  additionalSections: [
    {
      heading: "Derivation: From Classification to Dense Prediction — Why U-Net Has Skip Connections",
      content: `
A classification CNN repeatedly downsamples: each pooling/stride step halves spatial resolution while doubling semantic richness, until a $224\\times224$ image becomes, say, a $7\\times7\\times C$ feature map that feeds a single softmax. This is perfect for "what is this?" but throws away exactly the information segmentation needs: **where** each thing is, down to the pixel.

**The naive fix and its flaw.** A *fully convolutional network* (FCN) replaces the final dense layers with $1\\times1$ convolutions, producing a coarse $7\\times7\\times K$ grid of class scores, then upsamples back to full resolution. The problem: upsampling a $7\\times7$ map to $224\\times224$ can only invent smooth, blurry detail — every fine boundary was destroyed by pooling and cannot be recovered from the bottleneck alone.

**The U-Net insight.** The encoder *already computed* high-resolution feature maps on the way down — they were simply discarded. U-Net keeps them. It is symmetric: a contracting encoder and an expanding decoder. At each decoder stage it **upsamples** the coarse feature map (via transposed convolution or interpolation) and **concatenates** the matching-resolution encoder feature map through a *skip connection*, then convolves:

$$ d_\\ell = \\text{Conv}\\big(\\,[\\,\\text{Up}(d_{\\ell+1})\\;;\\;e_\\ell\\,]\\,\\big) $$

where $e_\\ell$ is the encoder feature at level $\\ell$ and $[\\cdot;\\cdot]$ is channel concatenation. The decoder thus gets *both* the deep, low-resolution **context** (what object this is) and the shallow, high-resolution **detail** (precisely where its edge falls). This is why U-Net masks have crisp boundaries while plain FCN masks are blobby — and why the same skip-connection idea reappears across modern segmentation networks.
      `,
    },
    {
      heading: "Derivation: Soft Dice Loss and Why It Beats Cross-Entropy Under Imbalance",
      content: `
Consider a scan where the tumor occupies $1\\%$ of pixels. A model that predicts "background everywhere" achieves $99\\%$ pixel accuracy and zero clinical value. Pixel-wise cross-entropy

$$ \\mathcal{L}_{CE} = -\\frac{1}{N}\\sum_{i} \\big[\\,g_i \\log \\hat{p}_i + (1-g_i)\\log(1-\\hat{p}_i)\\,\\big] $$

sums equally over all $N$ pixels, so the $99\\%$ background terms swamp the gradient and the model is barely penalized for missing the tumor.

**Dice ignores true negatives by construction.** Start from set overlap of a predicted mask $P$ and ground truth $G$:

$$ \\text{Dice} = \\frac{2|P\\cap G|}{|P| + |G|} = \\frac{2\\,TP}{2\\,TP + FP + FN} $$

Notice $TN$ never appears — the enormous correctly-classified background does not inflate the score. Empty-vs-empty agreement is not rewarded; only overlap with the actual object is.

**Making it differentiable.** $TP$, $FP$, $FN$ are computed from a hard (thresholded) mask, and thresholding has zero gradient. The *soft* Dice replaces the hard mask with the predicted probability $\\hat{p}_i \\in [0,1]$ and uses products/sums as continuous stand-ins for set intersection and size:

$$ \\mathcal{L}_{Dice} = 1 - \\frac{2\\sum_i \\hat{p}_i\\,g_i + \\epsilon}{\\sum_i \\hat{p}_i + \\sum_i g_i + \\epsilon} $$

Here $\\sum_i \\hat{p}_i g_i$ is a soft intersection (large only when the model is confident *and* the pixel is truly object), and $\\epsilon$ keeps the ratio well-defined (and equal to $1$, loss $0$) when both masks are empty. Because the denominator normalizes by mask size, a handful of object pixels carries the same weight as the whole background — so the gradient actually pushes the model to find small structures. In practice, a sum $\\mathcal{L}_{CE} + \\mathcal{L}_{Dice}$ (or focal + Dice) is common: cross-entropy gives smooth pixel-wise gradients early in training, while Dice directly optimizes the overlap metric you ultimately report.
      `,
    },
  ],
  comparisons: [
    {
      title: "Semantic vs Instance vs Panoptic Segmentation",
      methods: ["Semantic", "Instance", "Panoptic"],
      rows: [
        {
          dimension: "What each pixel gets",
          values: [
            "A class label only",
            "A class label + an instance id (for objects)",
            "A class label + an instance id for every pixel",
          ],
        },
        {
          dimension: "Separates individual objects?",
          values: [
            "No — all instances of a class merge",
            "Yes — car #1 vs car #2",
            "Yes, for countable 'things'",
          ],
        },
        {
          dimension: "Handles 'stuff' (sky, road)?",
          values: [
            "Yes",
            "Usually no — focuses on countable objects",
            "Yes — unifies 'stuff' and 'things'",
          ],
        },
        {
          dimension: "Typical architecture",
          values: [
            "FCN, U-Net, DeepLab",
            "Mask R-CNN (detect then segment per box)",
            "Panoptic FPN, Mask2Former",
          ],
        },
        {
          dimension: "Primary metric",
          values: [
            "mean IoU (mIoU)",
            "mask Average Precision (AP)",
            "Panoptic Quality (PQ)",
          ],
        },
      ],
      takeaway:
        "Pick the least expensive task that answers your question: semantic if you only need the class map, instance if you must count or separate objects, panoptic if you need a single complete labeling of the whole scene.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You need the **exact shape** of objects, not just their presence or a bounding box (e.g. tumor delineation, free-space estimation, background removal).",
      "Downstream geometry depends on pixel-precise boundaries (measuring areas, cutting masks, 3D reconstruction).",
      "Objects have **irregular or overlapping** outlines that a rectangle would misrepresent.",
      "You can obtain (or bootstrap from a foundation model like SAM) pixel-level masks for training or fine-tuning.",
    ],
    avoidWhen: [
      "A bounding box or a single image label already answers the question — segmentation adds annotation and compute cost for no benefit.",
      "You cannot afford pixel-level annotation and no usable pre-trained/zero-shot model exists for your domain.",
      "Hard real-time, low-power constraints make a full-resolution decoder too slow — a lighter detector may be the better trade-off.",
      "Your masks are extremely imbalanced and you can only use plain pixel accuracy/cross-entropy — without overlap-based losses and metrics the task will silently fail.",
    ],
    rulesOfThumb: [
      "Report Dice or mIoU, never pixel accuracy, on imbalanced masks.",
      "Start from a U-Net or DeepLab backbone pre-trained on a large dataset and fine-tune; training a decoder from scratch is rarely worth it.",
      "Combine cross-entropy with Dice (or focal) loss when the foreground is small.",
    ],
  },
  caseStudies: [
    {
      title: "U-Net wins the ISBI cell-segmentation challenge with only 30 training images",
      domain: "Biomedical imaging",
      scenario:
        "Microscopy segmentation datasets are tiny — the 2015 ISBI cell tracking challenge provided only a few dozen annotated images — yet pixel-accurate cell boundaries were required. Conventional deep networks of the time were data-hungry and produced blurry boundaries that merged touching cells.",
      approach:
        "U-Net paired a contracting encoder with a symmetric expanding decoder linked by skip connections, trained with heavy elastic deformation augmentation and a weighted loss that emphasized the thin borders separating touching cells, so very few images yielded many effective training examples.",
      outcome:
        "U-Net achieved an IoU of about **0.92 on the PhC-U373** dataset and **0.78 on DIC-HeLa**, beating the next-best methods (roughly 0.83 and 0.46 respectively) by a wide margin — and did so fast enough to segment a 512×512 image in well under a second on a GPU. The architecture became the default backbone for biomedical and many general segmentation tasks.",
      source: {
        title: "U-Net: Convolutional Networks for Biomedical Image Segmentation",
        authors: "Ronneberger, O., Fischer, P. and Brox, T.",
        url: "https://arxiv.org/abs/1505.04597",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "Two cars are parked bumper to bumper. Which task can tell that there are *two* cars and give each its own mask?",
      options: [
        { text: "Instance (or panoptic) segmentation.", correct: true },
        { text: "Semantic segmentation.", correct: false },
        { text: "Image classification.", correct: false },
        { text: "Any of them — they all separate instances.", correct: false },
      ],
      explanation:
        "Semantic segmentation merges all 'car' pixels into one region, so it cannot separate the two touching cars. Distinguishing individual instances of the same class requires instance (or panoptic) segmentation; classification only assigns a single image-level label.",
    },
    {
      question:
        "A predicted mask and the ground truth have TP = 60, FP = 20, FN = 40. What is the IoU?",
      options: [
        { text: "$60 / (60 + 20 + 40) = 0.5$", correct: true },
        { text: "$60 / (60 + 20) = 0.75$", correct: false },
        { text: "$2 \\cdot 60 / (2 \\cdot 60 + 20 + 40) = 0.67$", correct: false },
        { text: "$60 / 100 = 0.6$", correct: false },
      ],
      explanation:
        "IoU = TP / (TP + FP + FN) = 60 / 120 = 0.5. The third option is actually the *Dice* coefficient (0.67), which is always ≥ IoU because it counts the intersection twice in the numerator and denominator.",
    },
    {
      question:
        "Why do U-Net-style decoders use skip connections from the encoder?",
      options: [
        {
          text: "To restore the high-resolution spatial detail that downsampling discarded, giving sharp mask boundaries.",
          correct: true,
        },
        {
          text: "To reduce the number of parameters in the network.",
          correct: false,
        },
        {
          text: "To convert the segmentation problem into a classification problem.",
          correct: false,
        },
        {
          text: "To make the loss function convex.",
          correct: false,
        },
      ],
      explanation:
        "Pooling/striding builds semantic context but destroys fine spatial detail. Skip connections concatenate the encoder's high-resolution feature maps into the decoder, so the output combines deep context with precise boundaries — the reason U-Net masks are crisp rather than blobby.",
    },
    {
      question:
        "On a scan where the lesion is 1% of pixels, a model predicts 'background' everywhere. Which statement is correct?",
      options: [
        {
          text: "It scores ~99% pixel accuracy but ~0 Dice/IoU, which is why overlap metrics and Dice/focal losses are used.",
          correct: true,
        },
        {
          text: "It scores low pixel accuracy, correctly flagging the failure.",
          correct: false,
        },
        {
          text: "Its Dice score is ~0.99 because the background matches.",
          correct: false,
        },
        {
          text: "Cross-entropy will strongly penalize it and fix the problem on its own.",
          correct: false,
        },
      ],
      explanation:
        "Pixel accuracy is dominated by the 99% background, so it looks great while the model is useless. Dice/IoU ignore true negatives, so both are ~0, exposing the failure — and overlap-based or focal losses are needed because plain cross-entropy lets the background dominate the gradient.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Explain why a fully convolutional network that only upsamples from its bottleneck produces blurry masks, and how U-Net's design addresses this.",
      expectedAnswerRubric:
        "The answer should explain that successive downsampling (pooling/striding) discards high-resolution spatial detail, so upsampling a small bottleneck feature map can only interpolate smooth, imprecise boundaries. It should state that U-Net adds skip connections that concatenate the encoder's matching-resolution (high-detail) feature maps into the decoder, letting the output combine deep semantic context with fine spatial detail and thus produce sharp boundaries. A strong answer may mention transposed convolution/interpolation as the upsampling mechanism.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
