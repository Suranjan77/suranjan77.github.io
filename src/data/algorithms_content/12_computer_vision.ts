import { LearningModule } from "./types";

export const computerVision: LearningModule = {
  id: "computer-vision",
  title: "Computer Vision Foundations",
  category: "Computer Vision",
  prerequisites: ["cnn"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["cnn", "neural-networks"],
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
  workedExamples: [
    {
      title: 'Intersection over Union (IoU) Calculation',
      problem: 'A ground truth bounding box has area 100. A predicted bounding box has area 120. The area of their intersection is 60. Calculate IoU.',
      solution: 'Area of Union = Area(Ground Truth) + Area(Prediction) - Area(Intersection) = 100 + 120 - 60 = 160. IoU = $\\frac{\\text{Intersection Area}}{\\text{Union Area}} = \\frac{60}{160} = 0.375$ (or $37.5\\%$).',
    },
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
print(f"Number of boxes detected: {len(pred['boxes'])}")`
};
