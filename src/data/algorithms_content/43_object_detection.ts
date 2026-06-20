import { LearningModule } from "./types";

export const objectDetection: LearningModule = {
  id: "object-detection",
  title: "Object Detection",
  category: "Computer Vision",
  prerequisites: ["cnn", "computer-vision"],
  tracks: ["computer-vision"],
  difficulty: 3,
  relatedModules: ["computer-vision", "image-segmentation", "cnn", "vision-transformers"],
  shortDescription:
    "Find and classify every object in an image by predicting a labeled bounding box for each — the localization step between whole-image classification and per-pixel segmentation, scored by box overlap and mean average precision.",
  estimatedMinutes: 35,
  learningObjectives: [
    "Explain why detection needs both localization and classification for a variable, unknown number of objects",
    "Contrast two-stage (R-CNN family) and one-stage (YOLO, SSD, RetinaNet) detectors and their speed/accuracy trade-off",
    "Describe anchors, bounding-box regression, and how non-maximum suppression removes duplicate detections",
    "Interpret IoU, precision–recall, and mean average precision (mAP), and explain focal loss's role in fixing foreground–background imbalance",
  ],
  keyTerms: [
    {
      term: "Bounding Box",
      definition:
        "An axis-aligned rectangle (x, y, width, height) localizing an object, paired with a class label and a confidence score.",
    },
    {
      term: "Anchor Box",
      definition:
        "A predefined reference box of a fixed scale and aspect ratio, tiled across the image; the network predicts offsets that refine the anchor into a detection rather than regressing a box from scratch.",
    },
    {
      term: "Non-Maximum Suppression (NMS)",
      definition:
        "A greedy post-processing step that keeps the highest-scoring box and removes any lower-scoring box overlapping it above an IoU threshold, collapsing many redundant detections to one per object.",
    },
    {
      term: "mean Average Precision (mAP)",
      definition:
        "The detection headline metric: the area under the precision–recall curve (Average Precision) per class, averaged over classes and often over multiple IoU thresholds.",
    },
  ],
  misconceptions: [
    {
      claim:
        "Object detection is just image classification run on cropped regions.",
      correction:
        "Detection must also *localize* (regress precise box coordinates) and handle a *variable, unknown number* of objects at many scales and positions. Naively classifying every crop is the slow original R-CNN idea; modern detectors share computation and predict boxes and classes jointly.",
    },
    {
      claim:
        "More predicted boxes mean better detection.",
      correction:
        "Detectors emit thousands of overlapping candidate boxes per object; raw output is massively redundant. Non-maximum suppression (or set-based training, as in DETR) is required to collapse duplicates to one box per object — otherwise precision collapses.",
    },
    {
      claim:
        "One-stage detectors are always less accurate than two-stage ones.",
      correction:
        "One-stage detectors (YOLO, SSD) were initially less accurate mainly because of extreme foreground–background class imbalance. Focal loss (RetinaNet) fixed this, letting a one-stage detector match two-stage accuracy while staying faster.",
    },
  ],
  references: [
    {
      title: "Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks",
      authors: "Ren, S., He, K., Girshick, R. and Sun, J.",
      url: "https://arxiv.org/abs/1506.01497",
      type: "paper",
    },
    {
      title: "You Only Look Once: Unified, Real-Time Object Detection (YOLO)",
      authors: "Redmon, J., Divvala, S., Girshick, R. and Farhadi, A.",
      url: "https://arxiv.org/abs/1506.02640",
      type: "paper",
    },
    {
      title: "Focal Loss for Dense Object Detection (RetinaNet)",
      authors: "Lin, T.-Y., Goyal, P., Girshick, R., He, K. and Dollár, P.",
      url: "https://arxiv.org/abs/1708.02002",
      type: "paper",
    },
  ],
  failureModes: [
    {
      name: "Duplicate and overlapping detections",
      description:
        "Because anchors densely tile the image, a single object fires many high-scoring boxes. Without suppression the output is cluttered with near-duplicates, tanking precision.",
      mitigation:
        "Apply non-maximum suppression (or soft-NMS) at a tuned IoU threshold, or train a set-prediction detector (DETR) whose bipartite-matching loss makes duplicate-free predictions end to end.",
    },
    {
      name: "Foreground–background class imbalance",
      description:
        "A dense one-stage detector evaluates tens of thousands of anchors, almost all background. The easy-negative loss swamps the gradient, so the rare object anchors barely train.",
      mitigation:
        "Use focal loss to down-weight easy negatives (or hard-negative mining / OHEM), and balance positive/negative anchor sampling in two-stage detectors.",
    },
  ],
  fullDescription: `
Object detection sits between two tasks you already know. **Classification** answers "what is in this image?" with one label; **segmentation** answers "which class is every pixel?". **Detection** answers "what objects are here, and *where*?" — drawing a labeled, scored bounding box around each one. The hard part is that the number of objects is unknown and varies per image, and each must be both classified and precisely localized at any scale or position.

### Two families
**Two-stage detectors** (the R-CNN lineage) first *propose* candidate regions likely to contain objects, then classify and refine each:
- **R-CNN** ran a CNN on ~2000 region proposals independently — accurate but very slow.
- **Fast R-CNN** shared one convolutional pass and pooled features per region (ROI pooling).
- **Faster R-CNN** replaced external proposals with a learned **Region Proposal Network** using anchors, making the whole pipeline trainable and much faster.

**One-stage detectors** skip the proposal step and predict boxes and classes directly over a dense grid of anchors in a single pass:
- **YOLO** frames detection as one regression over a grid — extremely fast.
- **SSD** predicts at multiple feature-map scales.
- **RetinaNet** added **focal loss** to overcome the background imbalance that had held one-stage accuracy back.

### Scoring
Detections are matched to ground truth by **Intersection over Union (IoU)**; sweeping the confidence threshold yields a precision–recall curve whose area is **Average Precision**, averaged into **mAP**. Newer transformer detectors (**DETR**) recast detection as direct set prediction, removing anchors and NMS entirely.
  `,
  intuition: `
Imagine asking someone to mark up a busy street photo. Classification is them saying "it's a street scene." Detection is handing them a stack of sticky rectangles and saying "put one labeled box around each car, person, and sign — tightly."

Two strategies emerge. One person first squints and jots down "objects probably live *here, here, and here*" (region proposals), then carefully examines and labels each spot — thorough but slow. That is the **two-stage** approach. Another person, trained by lots of practice, just glances once and slaps down all the boxes in a single sweep — faster, occasionally messier. That is the **one-stage** approach.

Both run into the same nuisance: they instinctively stick *several* overlapping rectangles on each car. So afterward they tidy up — for each cluster of overlapping boxes on the same object, keep the most confident one and peel the rest off. That cleanup is **non-maximum suppression**, and it is why the raw, redundant output becomes one clean box per object.
  `,
  mathematics: `
### 1. Intersection over Union
Detection quality starts with how well a predicted box $P$ overlaps a ground-truth box $G$:

$$ \\text{IoU}(P,G) = \\frac{\\text{area}(P \\cap G)}{\\text{area}(P \\cup G)}. $$

A detection usually counts as correct if IoU $\\ge$ a threshold (e.g. $0.5$) and the class matches.

### 2. Box regression from anchors
Rather than predict raw coordinates, the network predicts offsets that transform an anchor $(x_a, y_a, w_a, h_a)$ into a box, which stabilizes learning:

$$ t_x = \\frac{x - x_a}{w_a}, \\quad t_y = \\frac{y - y_a}{h_a}, \\quad t_w = \\log\\frac{w}{w_a}, \\quad t_h = \\log\\frac{h}{h_a}. $$

### 3. Non-maximum suppression
Given scored boxes, repeatedly take the highest-scoring box $b^\\star$, output it, and discard every remaining box $b$ with $\\text{IoU}(b, b^\\star) \\ge \\tau_{\\text{nms}}$; repeat until none remain.

### 4. Average Precision and focal loss
Sweeping the score threshold traces a precision–recall curve; **AP** is its area, and **mAP** averages AP over classes (and IoU thresholds). To stop easy background anchors from dominating training, **focal loss** down-weights well-classified examples with a modulating factor:

$$ \\text{FL}(p_t) = -(1-p_t)^{\\gamma}\\,\\log(p_t), $$

where $p_t$ is the predicted probability of the true class and $\\gamma > 0$ (typically $2$) shrinks the loss for confident, easy cases so rare objects drive learning.
  `,
  pros: [
    "Localizes and labels a variable number of objects at once — the workhorse task for autonomous driving, surveillance, retail, and robotics.",
    "A clear speed/accuracy spectrum (one-stage real-time vs two-stage high-accuracy) lets you match the detector to the deployment budget.",
    "Mature, well-pretrained backbones and heads transfer well, and box annotation is far cheaper than per-pixel segmentation masks.",
  ],
  cons: [
    "Anchors, NMS thresholds, and IoU/score cutoffs add hyperparameters and hand-tuned post-processing (which DETR-style set prediction tries to remove).",
    "Dense detectors suffer severe foreground–background imbalance and struggle with very small, crowded, or heavily overlapping objects.",
    "Boxes are coarse: they cannot capture exact shape (use segmentation) and axis-aligned boxes fit rotated or articulated objects poorly.",
  ],
  codeSnippet: `import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.ops import nms

# Pretrained two-stage detector (COCO, 91 classes).
model = fasterrcnn_resnet50_fpn(weights="DEFAULT").eval()

img = torch.rand(3, 480, 640)                 # [channels, H, W]
with torch.no_grad():
    out = model([img])[0]                     # dict: boxes, labels, scores

boxes, scores, labels = out["boxes"], out["scores"], out["labels"]

# Keep confident boxes, then suppress overlapping duplicates (NMS).
keep_conf = scores > 0.5
boxes, scores, labels = boxes[keep_conf], scores[keep_conf], labels[keep_conf]
keep = nms(boxes, scores, iou_threshold=0.5)  # greedy non-maximum suppression
print("Detections after NMS:", len(keep))

def iou(a, b):
    x1, y1 = torch.max(a[:2], b[:2]); x2, y2 = torch.min(a[2:], b[2:])
    inter = (x2 - x1).clamp(min=0) * (y2 - y1).clamp(min=0)
    area = lambda z: (z[2] - z[0]) * (z[3] - z[1])
    union = area(a) + area(b) - inter
    return (inter / union).item() if union > 0 else 0.0`,
  tldr: [
    "**Detection = localization + classification** of a *variable* number of objects, each output as a labeled, scored **bounding box**.",
    "**Two-stage** detectors (R-CNN → Fast → Faster R-CNN) propose regions then classify/refine them; **one-stage** detectors (YOLO, SSD, RetinaNet) predict boxes directly in a single pass — faster, historically less accurate.",
    "Detectors predict **offsets from anchor boxes**, not raw coordinates, and emit many redundant boxes that **non-maximum suppression** collapses to one per object.",
    "Quality is matched by **IoU** and summarized by **mean Average Precision (mAP)** — the area under the precision–recall curve, averaged over classes and IoU thresholds.",
    "**Focal loss** (RetinaNet) fixes the foreground–background imbalance of dense one-stage detectors, closing the accuracy gap with two-stage methods.",
    "**DETR** recasts detection as direct **set prediction** with bipartite matching, removing anchors and NMS entirely.",
  ],
  additionalSections: [
    {
      heading: "Derivation: Why Dense Detectors Need Focal Loss",
      content: `
A one-stage detector like RetinaNet evaluates a *dense* set of anchors — on the order of $10^5$ per image — at every spatial location, scale, and aspect ratio. After matching anchors to ground truth, the overwhelming majority (often $>99\\%$) are **background**. This creates two linked problems for the standard cross-entropy classification loss.

Write binary cross-entropy as $\\text{CE}(p_t) = -\\log(p_t)$, where $p_t$ is the model's probability for the *correct* class. Even a confidently-correct easy negative (say $p_t = 0.9$) contributes a small but nonzero loss $-\\log(0.9) \\approx 0.105$. Multiply that by tens of thousands of easy negatives and their **summed gradient swamps** the few hundred informative foreground and hard-negative anchors. The detector minimizes the aggregate by getting *even better* at the easy background it already classifies, while the rare objects barely move the needle.

Focal loss adds a modulating factor $(1-p_t)^{\\gamma}$ in front of the log:

$$ \\text{FL}(p_t) = -(1-p_t)^{\\gamma}\\log(p_t). $$

Read what it does to the easy negative: at $p_t = 0.9$ and $\\gamma = 2$, the factor is $(1-0.9)^2 = 0.01$, cutting that example's loss **100×**. A hard example at $p_t = 0.5$ is scaled by only $0.25$ — barely touched. So the loss automatically **focuses** on the examples the model finds hard (foreground and ambiguous boxes) and all but ignores the sea of confident background. With this single change, RetinaNet — a one-stage detector — matched the accuracy of slower two-stage detectors, demonstrating that the historical accuracy gap was a *loss/imbalance* problem, not an architectural inevitability. (Two-stage detectors sidestep imbalance differently: the proposal stage filters most background before classification.)
      `,
    },
    {
      heading: "Derivation: Non-Maximum Suppression and the mAP Metric",
      content: `
**Why suppression is needed.** Detectors predict from anchors tiled densely across the image, so a single object overlaps many anchors that all fire with high score. The raw output is therefore highly redundant — dozens of near-identical boxes per object. We need to collapse each cluster to one representative.

**The NMS algorithm.** Greedy non-maximum suppression does this per class: sort all boxes by score; pop the top box $b^\\star$ and add it to the output; remove every remaining box $b$ with $\\text{IoU}(b, b^\\star) \\ge \\tau_{\\text{nms}}$; repeat until the list is empty. The threshold $\\tau_{\\text{nms}}$ (often $0.5$) is a trade-off: too low merges distinct nearby objects into one; too high lets duplicates survive. *Soft-NMS* refines this by decaying overlapping boxes' scores instead of deleting them outright, which helps in crowded scenes.

**Scoring what survives.** After NMS, each kept box is a true positive if it matches an unmatched ground-truth box at IoU $\\ge$ threshold and class agrees; otherwise it is a false positive, and unmatched ground truths are false negatives. Sweeping the *confidence* threshold from high to low traces a **precision–recall curve**: high thresholds give few, precise boxes (high precision, low recall); low thresholds catch more objects but admit false positives. The **Average Precision (AP)** for a class is the area under this curve — a single number capturing the whole precision/recall trade-off. **mAP** averages AP across all classes, and benchmarks like COCO further average over IoU thresholds from $0.5$ to $0.95$ (written mAP@[.5:.95]) to reward precise localization, not just rough hits. This is why a detector's headline number is mAP and not accuracy: it jointly measures *finding* objects and *localizing* them well.
      `,
    },
  ],
  comparisons: [
    {
      title: "Two-Stage vs One-Stage vs Set-Prediction Detectors",
      methods: ["Two-Stage (Faster R-CNN)", "One-Stage (YOLO/RetinaNet)", "Set Prediction (DETR)"],
      rows: [
        {
          dimension: "Pipeline",
          values: [
            "Propose regions, then classify/refine",
            "Predict boxes directly over dense anchors",
            "Transformer predicts a fixed set of boxes",
          ],
        },
        {
          dimension: "Speed",
          values: ["Slower", "Fast / real-time", "Moderate"],
        },
        {
          dimension: "Accuracy",
          values: [
            "Historically highest",
            "Matched two-stage with focal loss",
            "Competitive, simpler pipeline",
          ],
        },
        {
          dimension: "Needs anchors & NMS?",
          values: ["Yes (anchors + NMS)", "Yes (anchors + NMS)", "No — neither"],
        },
        {
          dimension: "Class imbalance handling",
          values: [
            "Proposal stage filters background",
            "Focal loss / hard-negative mining",
            "Bipartite matching loss",
          ],
        },
      ],
      takeaway:
        "Pick one-stage (YOLO/RetinaNet) for real-time budgets, two-stage (Faster R-CNN) when accuracy is paramount, and DETR-style models when you want to drop the anchor/NMS machinery for an end-to-end pipeline.",
    },
  ],
  usageGuidance: {
    useWhen: [
      "You need to **count, locate, or track multiple objects** in a scene (driving, surveillance, retail shelf analysis, robotics).",
      "A **bounding box is enough** spatial precision — you do not need exact pixel shape (else use segmentation).",
      "You have a **latency budget** to respect: choose a one-stage detector for real-time, a two-stage one for maximum accuracy.",
      "Box-level annotations are available or affordable, which they usually are relative to per-pixel masks.",
    ],
    avoidWhen: [
      "You only need a single image-level label — plain classification is far cheaper.",
      "You need the **exact outline** of objects (medical contours, background removal) — use instance segmentation instead.",
      "Objects are **rotated, articulated, or extremely crowded/overlapping**, where axis-aligned boxes and NMS struggle (consider rotated boxes, keypoints, or set prediction).",
      "You cannot tune the post-processing (NMS/score thresholds) and need a fully end-to-end model — prefer a DETR-style detector.",
    ],
    rulesOfThumb: [
      "Start from a pretrained detector (Faster R-CNN or a YOLO variant) and fine-tune; rarely train from scratch.",
      "Report mAP@[.5:.95], not accuracy, and tune the NMS IoU and confidence thresholds on a validation set.",
      "If a dense one-stage detector underfits objects, suspect class imbalance and use focal loss.",
    ],
  },
  caseStudies: [
    {
      title: "Faster R-CNN makes region proposals learnable — and near real-time",
      domain: "Object detection",
      scenario:
        "By 2015, the R-CNN family was accurate but bottlenecked by an external, hand-crafted region-proposal step (selective search) that ran on the CPU and dominated runtime, making detection far too slow for practical or real-time use.",
      approach:
        "Ren et al. introduced the Region Proposal Network (RPN): a small convolutional network that slides over the shared feature map and, using a set of reference anchor boxes at multiple scales and aspect ratios, predicts objectness scores and box refinements. The RPN shares convolutional features with the detection head, so proposals become a learned, nearly free part of one end-to-end network.",
      outcome:
        "Faster R-CNN reached about **73.2% mAP on PASCAL VOC 2007** while running at roughly **5 frames per second** on a GPU — orders of magnitude faster than selective-search pipelines — and won multiple tracks of the ILSVRC and COCO 2015 detection challenges. Anchors and the RPN became foundational ideas reused across later detectors.",
      source: {
        title: "Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks",
        authors: "Ren, S., He, K., Girshick, R. and Sun, J.",
        url: "https://arxiv.org/abs/1506.01497",
        type: "paper",
      },
    },
  ],
  quiz: [
    {
      question:
        "How does object detection differ fundamentally from image classification?",
      options: [
        {
          text: "It must localize (predict box coordinates) and classify a variable, unknown number of objects, not assign one label to the whole image.",
          correct: true,
        },
        {
          text: "It uses a different color space for the input image.",
          correct: false,
        },
        {
          text: "It always operates on a fixed number of objects per image.",
          correct: false,
        },
        {
          text: "It only works on grayscale images.",
          correct: false,
        },
      ],
      explanation:
        "Classification outputs a single image-level label. Detection must output a labeled, scored bounding box for each of a variable, a-priori-unknown number of objects, jointly solving localization and classification at many scales and positions.",
    },
    {
      question:
        "Why is non-maximum suppression applied to a detector's raw output?",
      options: [
        {
          text: "Dense anchors make each object fire many overlapping boxes; NMS keeps the top-scoring one and removes lower-scoring boxes overlapping it, collapsing duplicates.",
          correct: true,
        },
        {
          text: "It increases the number of detections to improve recall.",
          correct: false,
        },
        {
          text: "It converts bounding boxes into segmentation masks.",
          correct: false,
        },
        {
          text: "It normalizes the image brightness before detection.",
          correct: false,
        },
      ],
      explanation:
        "Anchors tiled densely across the image cause many near-duplicate high-scoring boxes per object. NMS greedily keeps the highest-scoring box and discards any remaining box overlapping it above an IoU threshold, leaving roughly one box per object so precision does not collapse.",
    },
    {
      question:
        "What problem does focal loss solve in dense one-stage detectors?",
      options: [
        {
          text: "Extreme foreground–background imbalance — it down-weights easy, well-classified background anchors so rare objects drive training.",
          correct: true,
        },
        {
          text: "Slow convergence of the region proposal network.",
          correct: false,
        },
        {
          text: "Excessive memory use from high-resolution feature maps.",
          correct: false,
        },
        {
          text: "Boxes being rotated relative to the image axes.",
          correct: false,
        },
      ],
      explanation:
        "A dense detector scores ~10^5 anchors, almost all background. Standard cross-entropy lets the many easy negatives dominate the gradient. Focal loss multiplies CE by $(1-p_t)^{\\gamma}$, shrinking the loss for confident easy cases (≈100× at $p_t=0.9$, $\\gamma=2$) so the model focuses on hard foreground anchors — letting RetinaNet match two-stage accuracy.",
    },
    {
      question:
        "A predicted box and a ground-truth box have intersection area 40 and union area 100. Is this a correct detection at the standard IoU ≥ 0.5 threshold (assume the class matches)?",
      options: [
        { text: "No — IoU = 40/100 = 0.4, which is below 0.5.", correct: true },
        { text: "Yes — IoU = 40/100 = 0.4, which passes.", correct: false },
        { text: "Yes — any overlap counts as a correct detection.", correct: false },
        { text: "Cannot tell without the confidence score.", correct: false },
      ],
      explanation:
        "IoU = intersection / union = 40/100 = 0.4. Since 0.4 < 0.5, the box fails the standard matching threshold and would count as a false positive (and the ground truth as a missed detection), even though the class is right.",
    },
  ],
  shortAnswerQuestions: [
    {
      question:
        "Contrast two-stage and one-stage detectors, and explain why one-stage detectors were initially less accurate and how that gap was closed.",
      expectedAnswerRubric:
        "A strong answer should explain that two-stage detectors (R-CNN → Fast → Faster R-CNN) first propose candidate regions (eventually via a learned RPN with anchors) and then classify/refine them, while one-stage detectors (YOLO, SSD) predict boxes and classes directly over a dense anchor grid in a single pass, trading some accuracy for speed. It should identify the cause of the early one-stage accuracy gap as extreme foreground–background class imbalance — the dense detector evaluates ~10^5 mostly-background anchors, whose summed cross-entropy loss swamps the rare foreground — and explain that focal loss (RetinaNet) down-weights easy negatives via the $(1-p_t)^{\\gamma}$ factor so hard examples dominate, closing the gap. Bonus: noting two-stage methods avoid imbalance because the proposal stage filters most background, and that DETR removes anchors/NMS via set prediction.",
    },
  ],
  review: {
    lastReviewed: "2026-06-20",
    reviewedBy: "Suranjan",
    status: "published",
  },
};
