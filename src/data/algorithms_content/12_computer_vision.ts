import { LearningModule } from "./types";

export const computerVision: LearningModule = {
  id: "computer-vision",
  title: "Computer Vision Foundations",
  category: "Computer Vision",
  prerequisites: ["cnn"],
  tracks: ["modern-ai", "computer-vision"],
  difficulty: 3,
  relatedModules: ["cnn", "neural-networks", "image-segmentation", "vision-transformers"],
  shortDescription: "The broad field of enabling computers to see, segment, track, and interpret visual data from the physical world.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Distinguish between classification, object detection, semantic segmentation, and instance segmentation',
    'Explain how bounding boxes are represented and predicted',
    'Compute Intersection over Union (IoU) to evaluate object detection boundaries',
    'Describe standard feature extractor (backbone) architectures used in computer vision',
  ],
  keyTerms: [
    { term: 'Intersection over Union (IoU)', definition: 'An evaluation metric used to measure the accuracy of an object detector on a particular dataset.' },
    { term: 'Anchor Box', definition: 'Pre-defined bounding boxes of specific sizes and aspect ratios used as reference shapes for object detection.' },
    { term: 'Semantic Segmentation', definition: 'The process of classifying each pixel in an image into a semantic class category.' },
  ],
  misconceptions: [
    {
      claim: 'Semantic segmentation distinguishes between individual instances of the same class.',
      correction: 'Semantic segmentation labels all pixels of a class (e.g. all sheep) with the same color, treating them as a single region. Instance segmentation distinguishes individual sheep as separate objects.'
    },
    {
      claim: 'Object detection models must scan the image pixel-by-pixel with sliding windows.',
      correction: 'Modern detectors like YOLO or Faster R-CNN process the entire image in a single forward pass, predicting all boxes and classes simultaneously.'
    }
  ],
  references: [
    {
      title: "Computer Vision: Algorithms and Applications",
      authors: "Szeliski, R",
      url: "https://szeliski.org/Book/",
      type: "textbook"
    },
    {
      title: "Deep Learning for Computer Vision",
      authors: "Rosebrock, A",
      url: "https://pyimagesearch.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Occlusion and Scale Variations',
      description: 'Objects that are partially hidden (occluded) or extremely small relative to training data are often missed by detector heads.',
      mitigation: 'Use Feature Pyramid Networks (FPN) and data augmentation like random cropping and mosaicing.'
    }
  ],

  fullDescription: `
Computer Vision (CV) bridges the gap between raw camera pixel grids and semantic physical understanding. While image classification assigns a single label to an entire image, practical computer vision covers:

1. **Object Detection**: Finding where objects are, drawing bounding boxes, and classifying them.
2. **Semantic & Instance Segmentation**: Classifying every single pixel in the image, carving out exact item borders.
3. **Keypoint Detection**: Tracking specific anatomical joints or structural landmarks across image space.

These techniques form the core of self-driving cars, industrial automation, medical diagnostics, and spatial computing.
  `,

  intuition: `
Imagine trying to teach a computer to outline objects on a chalkboard. Standard image classification is like shouting "there's a dog on the board!".

Object detection is like walking up to the board and drawing a chalk box around the dog's body. Semantic segmentation is like taking colored paint and carefully coloring every single pixel that belongs to the dog, coloring the grass green, and the sidewalk gray, carving out the exact geometric reality of the scene.
  `,

  mathematics: `
### 1. Intersection over Union (IoU)
To evaluate how accurately a bounding box prediction ($B_{pred}$) matches the ground truth box ($B_{gt}$), we compute the ratio of their overlap area to their total union area:

$$ \\text{IoU} = \\frac{\\text{Area of Overlap}}{\\text{Area of Union}} = \\frac{|B_{gt} \\cap B_{pred}|}{|B_{gt} \\cup B_{pred}|} $$

An IoU $\\ge 0.5$ is typically considered a successful overlap matching.

### 2. Multi-Task Bounding Box Loss
Object detectors optimize both where the box is (localization) and what is inside it (classification):

$$ \\mathcal{L}_{total} = \\mathcal{L}_{class}(p, p^*) + \\lambda \\cdot \\mathbb{I}_{[u \\ge 1]} \\mathcal{L}_{loc}(t, t^*) $$

Where $p$ is class probability, $p^*$ is true label, $t$ is predicted box offsets, $t^*$ is target offsets, and $\\mathbb{I}_{[u \\ge 1]}$ activates localization loss only when an object actually exists in the region.
  `,

  pros: [
    "High spatial precision: Provides detailed pixel masks, bounding coordinates, and labels.",
    "Real-world utility: Essential for visual sorting, camera alignment, self-driving navigation, and robotic limbs.",
    "Rich pre-trained models: Access to powerful pre-trained models (like Segment Anything or YOLO) that perform zero-shot tasks."
  ],

  cons: [
    "Extremely expensive annotation: Marking individual pixels or drawing thousands of tight bounding boxes requires significant manual labor.",
    "Condition sensitivity: Highly sensitive to shadows, lighting shifts, motion blur, and camera lens distortions.",
    "High memory requirements: Running real-time high-resolution detection pipelines demands high VRAM and compute."
  ],

  codeSnippet: `import torch
import torchvision.models.detection as detection

# Load a pre-trained Object Detection model (Faster R-CNN)
# It detects 80 standard COCO classes (cars, dogs, people, etc.)
model = detection.fasterrcnn_resnet50_fpn(pretrained=True)
model.eval() # Set model to evaluation mode

# Create a fake image batch: [batch_size, channels, height, width]
# Normalized between 0 and 1
fake_images = [torch.rand(3, 300, 300)]

# Run inference!
with torch.no_grad():
    predictions = model(fake_images)

# Inspect predictions for the first image
pred = predictions[0]
print("Detected keys:", pred.keys())
# Output contains 'boxes' (coordinates), 'labels' (classes), and 'scores' (confidence)
print(f"Number of boxes detected: {len(pred['boxes'])}")`,
  tldr: [
    'Computer vision tasks form a hierarchy of increasing spatial detail: **classification** (one label per image) → **detection** (boxes + labels for each object) → **segmentation** (a label for every pixel).',
    'Object detection is graded with **Intersection over Union (IoU)**, $IoU = \\frac{\\text{Area of Overlap}}{\\text{Area of Union}}$, which checks whether a predicted box sufficiently overlaps the ground truth.',
    'Modern detectors (YOLO, Faster R-CNN) place a dense grid of **anchor boxes** over the image and turn detection into per-anchor classification (is there an object, and which class?) plus regression (how to nudge this anchor into a tight box).',
    'Segmentation networks use **per-pixel** losses (pixel-wise cross-entropy or Dice loss) because a single per-image label cannot express where an object’s boundary actually lies.',
    'As granularity increases, so does annotation cost and compute: classification labels are cheap, bounding boxes are moderate effort, and pixel masks are the most expensive to collect.',
    'Evaluation metrics track the task: top-1/top-5 **accuracy** for classification, **mAP** (mean Average Precision over IoU thresholds) for detection, and **mIoU** (mean IoU per class) for segmentation.',
  ],
  additionalSections: [
    {
      heading: 'Derivation: Intersection over Union (IoU) and Its Role in NMS and mAP',
      content: `
IoU measures how well a predicted bounding box $B_{pred}$ overlaps a ground-truth box $B_{gt}$:

$$ IoU = \\frac{\\text{Area of Overlap}}{\\text{Area of Union}} = \\frac{|B_{gt} \\cap B_{pred}|}{|B_{gt} \\cup B_{pred}|} $$

Both terms are computed from axis-aligned rectangle coordinates. Given a box as $(x_1, y_1, x_2, y_2)$ — top-left and bottom-right corners — the intersection rectangle has corners:

$$ x_1^{\\cap} = \\max(x_1^{gt}, x_1^{pred}), \\quad y_1^{\\cap} = \\max(y_1^{gt}, y_1^{pred}) $$
$$ x_2^{\\cap} = \\min(x_2^{gt}, x_2^{pred}), \\quad y_2^{\\cap} = \\min(y_2^{gt}, y_2^{pred}) $$

If $x_2^{\\cap} \\le x_1^{\\cap}$ or $y_2^{\\cap} \\le y_1^{\\cap}$, the boxes do not overlap and the intersection area is $0$. Otherwise:

$$ \\text{Area}_{\\cap} = (x_2^{\\cap} - x_1^{\\cap}) \\times (y_2^{\\cap} - y_1^{\\cap}) $$

The union is the sum of the two box areas minus the (already counted once too often) intersection:

$$ \\text{Area}_{\\cup} = \\text{Area}_{gt} + \\text{Area}_{pred} - \\text{Area}_{\\cap} $$

**Worked numeric example.** Let the ground-truth box be $B_{gt} = (10, 10, 50, 50)$ (a $40 \\times 40$ square, area $1600$) and the predicted box be $B_{pred} = (30, 30, 70, 70)$ (a $40 \\times 40$ square, area $1600$). The intersection rectangle corners are:

$$ x_1^{\\cap} = \\max(10, 30) = 30, \\quad y_1^{\\cap} = \\max(10, 30) = 30 $$
$$ x_2^{\\cap} = \\min(50, 70) = 50, \\quad y_2^{\\cap} = \\min(50, 70) = 50 $$

So the intersection is a $20 \\times 20$ square: $\\text{Area}_{\\cap} = 400$. The union is:

$$ \\text{Area}_{\\cup} = 1600 + 1600 - 400 = 2800 $$

$$ IoU = \\frac{400}{2800} \\approx 0.143 $$

Since $0.143 < 0.5$, this pair would typically be rejected as a true positive under the common IoU $\\ge 0.5$ threshold.

**Use in Non-Max Suppression (NMS).** A detector usually proposes many overlapping boxes for the same object. NMS keeps the highest-confidence box, computes IoU between it and every remaining box, and discards any box whose IoU with the kept box exceeds a threshold (commonly $0.5$–$0.7$), since those boxes are almost certainly duplicate detections of the same object. The process repeats with the next highest-confidence surviving box until none remain.

**Use in mean Average Precision (mAP).** To score a detector, each predicted box is matched to a ground-truth box: if $IoU \\ge \\tau$ (e.g. $\\tau = 0.5$) and the class matches, it counts as a true positive; otherwise it is a false positive. Sweeping the confidence threshold traces out a precision-recall curve, and Average Precision (AP) is the area under that curve for one class. mAP averages AP across classes (and, in COCO-style evaluation, across several IoU thresholds such as $0.5{:}0.05{:}0.95$), so a detector is rewarded only when its boxes are both confidently and *tightly* localized.
      `,
    },
    {
      heading: 'Derivation: Anchor Boxes — Turning Detection into Classification + Regression',
      content: `
Naively, "find all objects in an image" looks like an open-ended structured-prediction problem: an unknown number of boxes, each with unknown size, position, and class. Anchor-box detectors (Faster R-CNN’s RPN, SSD, YOLOv2 onward) sidestep this by tiling the image with a fixed, dense set of **anchor boxes** — boxes of pre-defined sizes and aspect ratios centered at every cell of a convolutional feature map. Because the *set* of anchors is fixed in advance, the network no longer has to predict box coordinates directly; it only has to predict, **per anchor**, (a) whether the anchor matches an object, (b) which class, and (c) a small offset correction to the anchor’s shape — converting an unbounded structured problem into a fixed-size classification-plus-regression problem.

**Assigning targets to anchors.** During training, each anchor $a$ is matched to the ground-truth box with which it has the highest IoU. If that IoU exceeds a positive threshold (e.g. $0.7$), the anchor is a positive example with target class $p^* = $ that object’s class; if it is below a low threshold (e.g. $0.3$), it is a negative ("background") example; anchors in between are typically ignored during training.

**Regression target (offsets, not raw coordinates).** Instead of regressing absolute pixel coordinates, the network regresses a normalized offset between anchor $a = (x_a, y_a, w_a, h_a)$ (center coordinates, width, height) and the matched ground-truth box $g = (x_g, y_g, w_g, h_g)$:

$$ t_x^* = \\frac{x_g - x_a}{w_a}, \\quad t_y^* = \\frac{y_g - y_a}{h_a}, \\quad t_w^* = \\log\\frac{w_g}{w_a}, \\quad t_h^* = \\log\\frac{h_g}{h_a} $$

These offsets are small, roughly zero-centered numbers regardless of the anchor’s absolute scale, which makes them far easier for a network to regress than raw pixel coordinates.

**The combined loss.** Every anchor contributes a classification loss, and only **positive** anchors (those matched to a real object, indicated by $\\mathbb{I}_{[u \\ge 1]}$) contribute a localization loss:

$$ \\mathcal{L}(\\{p_i\\}, \\{t_i\\}) = \\frac{1}{N_{cls}}\\sum_i \\mathcal{L}_{cls}(p_i, p_i^*) \\;+\\; \\lambda \\frac{1}{N_{reg}}\\sum_i \\mathbb{I}_{[u_i \\ge 1]}\\, \\mathcal{L}_{loc}(t_i, t_i^*) $$

Here $\\mathcal{L}_{cls}$ is typically (binary or multi-class) cross-entropy over object/background or class scores, and $\\mathcal{L}_{loc}$ is a robust regression loss — most commonly **smooth-L1** (Huber-style), defined per coordinate as:

$$ \\text{smooth}_{L1}(x) = \\begin{cases} 0.5x^2 & \\text{if } |x| < 1 \\\\ |x| - 0.5 & \\text{otherwise} \\end{cases}, \\qquad x = t_i - t_i^* $$

Smooth-L1 behaves like squared error near zero (stable gradients for small, easy-to-fix offsets) but like absolute error for large residuals (less sensitive to occasional badly-matched anchors than a pure squared loss would be). The hyperparameter $\\lambda$ balances how strongly localization accuracy is weighted against classification accuracy, and dividing by $N_{cls}$ / $N_{reg}$ (the number of anchors contributing to each term) keeps the loss scale roughly independent of how many anchors happen to be positive in a given image.
      `,
    },
  ],
  comparisons: [
    {
      title: 'Image Classification vs Object Detection vs Semantic Segmentation',
      methods: ['Image Classification', 'Object Detection', 'Semantic Segmentation'],
      rows: [
        {
          dimension: 'Output granularity',
          values: ['One label for the whole image', 'A set of bounding boxes, each with a class and confidence score', 'One class label for every pixel in the image'],
        },
        {
          dimension: 'Typical loss function',
          values: ['Cross-entropy over image-level class scores', 'Combined loss: classification (cross-entropy) + localization (smooth-L1 / IoU-based) per anchor or proposal', 'Pixel-wise cross-entropy, often combined with a region-overlap loss like Dice or Tversky loss'],
        },
        {
          dimension: 'Typical architecture',
          values: ['CNN backbone (ResNet, EfficientNet, ViT) + global pooling + softmax head', 'Backbone + region proposal/anchor mechanism + detection heads (Faster R-CNN, YOLO, SSD, DETR)', 'Backbone + encoder-decoder with skip connections to recover spatial resolution (U-Net, DeepLab, Mask R-CNN’s mask head)'],
        },
        {
          dimension: 'Evaluation metric',
          values: ['Top-1 / Top-5 accuracy', 'mean Average Precision (mAP) across classes and IoU thresholds', 'mean Intersection over Union (mIoU) across classes'],
        },
        {
          dimension: 'Annotation cost',
          values: ['Lowest — one label per image', 'Moderate — bounding box per object instance', 'Highest — a label for every pixel'],
        },
      ],
      takeaway: 'Each step up the hierarchy — classification to detection to segmentation — trades cheaper, coarser supervision for richer, more spatially precise output, and the loss/architecture/metric all co-evolve to match exactly how much spatial detail the task demands.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'You only need to know **what** is in an image, not where (e.g. tagging photos by scene type) — use classification; it is the cheapest to train and label.',
      'You need to count, locate, or track discrete **object instances** (e.g. counting cars, tracking pedestrians, retail shelf auditing) — use object detection.',
      'You need precise **pixel-level boundaries** for downstream geometric reasoning (e.g. medical tumor delineation, autonomous-driving free-space estimation, background removal) — use semantic or instance segmentation.',
      'You have limited compute or need real-time inference on edge devices and only coarse localization is acceptable — a single-stage detector (YOLO/SSD) is usually the right tradeoff over a two-stage detector or full segmentation network.',
    ],
    avoidWhen: [
      'You don’t have the budget to collect bounding-box or pixel-mask annotations — consider weak supervision (image-level labels with class-activation maps) or pre-trained zero-shot models before committing to full detection/segmentation labeling.',
      'Objects of interest rarely overlap and only coarse location matters — full per-pixel segmentation is overkill and adds unnecessary annotation and compute cost; bounding boxes suffice.',
      'Real-time, low-latency constraints are critical and you would need a heavy two-stage detector or large segmentation backbone — these add substantial inference latency versus a lighter classifier or single-stage detector.',
      'Your classes are highly imbalanced at the pixel level (e.g. tiny lesions in a mostly-background medical image) and you only use plain pixel-wise cross-entropy — this will be dominated by the background class; you need to also account for class imbalance (e.g. with Dice/focal loss) or the task is a poor fit as posed.',
    ],
    rulesOfThumb: [
      'Always report mAP at multiple IoU thresholds (e.g. COCO’s 0.5:0.95) rather than a single threshold — a detector can look great at IoU 0.5 and mediocre at IoU 0.75.',
      'When tuning NMS, a lower IoU threshold removes more duplicate boxes but risks merging genuinely distinct, closely-spaced objects.',
      'Start from a backbone pre-trained on a large dataset (ImageNet/COCO) and fine-tune — training detection/segmentation heads from scratch is rarely worth it given how data-hungry these tasks are.',
    ],
  },
  caseStudies: [
    {
      title: 'YOLO: Real-Time Object Detection as a Single Regression Problem',
      domain: 'Real-time object detection',
      scenario: 'Two-stage detectors like Faster R-CNN achieved strong accuracy but ran too slowly for real-time applications such as video surveillance and robotics, since they first generate region proposals and only then classify each one in a second pass.',
      approach: 'YOLO (You Only Look Once) reframes detection as a single regression problem solved in one forward pass: the image is divided into a grid, and each grid cell directly predicts bounding-box coordinates, objectness confidence, and class probabilities simultaneously for a fixed set of anchors, eliminating the separate proposal stage entirely.',
      outcome: 'The original YOLO ran at 45 frames per second (and a smaller "Fast YOLO" variant at 155 FPS) while achieving competitive mean Average Precision on PASCAL VOC, roughly 2x or more the speed of contemporary two-stage detectors at a modest accuracy cost — establishing single-stage, anchor-based detection as the standard approach for real-time applications.',
      source: {
        title: 'You Only Look Once: Unified, Real-Time Object Detection',
        authors: 'Redmon, J., Divvala, S., Girshick, R. and Farhadi, A.',
        url: 'https://arxiv.org/abs/1506.02640',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'In the context of semantic segmentation, why is a pixel-wise loss function typically employed, and how is it often augmented to handle real-world data distributions?',
      expectedAnswerRubric: 'The answer should explain that image-level loss lacks spatial boundary information. It must note that pixel-wise cross-entropy provides local gradients for correct classification at every spatial location, and typically mention that it is often combined with region-overlap losses (like Dice loss) to handle class imbalance.'
    }
  ],
  quiz: [
    {
      question: 'A ground-truth box has area 200, a predicted box has area 180, and their intersection has area 90. What is the IoU?',
      options: [
        { text: '$90 / (200 + 180 - 90) = 90/290 \\approx 0.31$', correct: true },
        { text: '$90 / 200 = 0.45$', correct: false },
        { text: '$90 / 180 = 0.5$', correct: false },
        { text: '$(200+180)/90 \\approx 4.2$', correct: false },
      ],
      explanation: 'IoU divides the intersection area by the **union** area, and union $= $ Area(gt) $+$ Area(pred) $-$ Area(intersection) $= 200 + 180 - 90 = 290$, giving $IoU = 90/290 \\approx 0.31$. Dividing by just one box’s area (200 or 180) is a common mistake but not the IoU definition.',
    },
    {
      question: 'What is the primary purpose of Non-Max Suppression (NMS) in an object detection pipeline?',
      options: [
        { text: 'To discard duplicate, highly-overlapping boxes for the same object, keeping only the highest-confidence one.', correct: true },
        { text: 'To increase the number of anchor boxes evaluated per image.', correct: false },
        { text: 'To convert a classification problem into a regression problem.', correct: false },
        { text: 'To normalize pixel intensities before feeding the image into the backbone.', correct: false },
      ],
      explanation: 'Detectors typically propose many overlapping boxes around the same real object. NMS keeps the highest-confidence box and suppresses other boxes whose IoU with it exceeds a threshold, leaving roughly one box per actual object.',
    },
    {
      question: 'In anchor-box-based detectors, why is the localization target expressed as an offset like $t_w^* = \\log(w_g / w_a)$ rather than the raw ground-truth width $w_g$?',
      options: [
        { text: 'The offset is small and roughly scale-invariant regardless of the anchor’s absolute size, which is much easier for a network to regress than raw pixel widths.', correct: true },
        { text: 'Raw pixel widths cannot be represented as floating point numbers.', correct: false },
        { text: 'The logarithm guarantees the loss is convex.', correct: false },
        { text: 'It removes the need for a classification loss entirely.', correct: false },
      ],
      explanation: 'Regressing a normalized, near-zero-centered offset relative to the matched anchor makes the regression target’s scale roughly consistent across anchors of very different absolute sizes, which stabilizes training compared to regressing raw, widely varying pixel coordinates directly.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
