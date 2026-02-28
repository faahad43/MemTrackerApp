import torch
import open_clip
import cv2
from PIL import Image
from .activity_interface import ActivityInterface

class ZeroShotActivity(ActivityInterface):
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
        self.model.to(self.device)
        self.tokenizer = open_clip.get_tokenizer('ViT-B-32')
        self.labels = ["walking", "sitting", "running", "falling down"]
        self.text_tokens = self.tokenizer(self.labels).to(self.device)
        print(f"CLIP Module loaded on {self.device}")

    def classify(self, tracks, frame):
        results = []
        for track in tracks:
            x1, y1, x2, y2 = map(int, track.xyxy[0])
            crop = frame[y1:y2, x1:x2]
            
            if crop.size == 0: continue

            image = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            image_features = self.model.encode_image(image_input)
            text_features = self.model.encode_text(self.text_tokens)
            
            image_features /= image_features.norm(dim=-1, keepdim=True)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            
            text_probs = (100.0 * image_features @ text_features.T).softmax(dim=-1)
            probs = text_probs.cpu().numpy()[0]

            
            best_idx = probs.argmax()
            results.append({
                "track_id": int(track.id),
                "activity": self.labels[best_idx],
                "confidence": float(probs[best_idx])
            })
        return results