"""Estimate Depth Pro and Marigold normals on neutral-background suit crops."""
import os, sys, time, json
from pathlib import Path
import numpy as np
from PIL import Image
import torch
look=sys.argv[sys.argv.index('--look')+1] if '--look' in sys.argv else 'suit-quay'
OUT=Path('design/malum-interactive/suit-comparison') if look=='suit-quay' else Path(f'design/malum-interactive/{look}-hybrid');OUT.mkdir(parents=True,exist_ok=True)
if '--crop' in sys.argv:
 OUT=OUT/'model-crop';OUT.mkdir(parents=True,exist_ok=True)
subject=Image.open(f'public/collections/malum/hero/interactive/{look}.webp').convert('RGBA')
image=Image.new('RGBA',subject.size,(110,110,110,255))
image.alpha_composite(subject)
image=image.convert('RGB')
alpha=subject.getchannel('A')
bounds=alpha.point(lambda x:255 if x>100 else 0).getbbox()
box=(max(0,bounds[0]-65),0,min(image.width,bounds[2]+65),image.height)
if '--crop' in sys.argv:
 image=image.crop(box)
 image.save(OUT/'input.png')
torch.set_num_threads(4)
device='mps' if torch.backends.mps.is_available() else 'cpu'
if look!='suit-quay' and device!='mps':
 raise RuntimeError('This batch requires MPS GPU access; rerun outside the restricted sandbox.')
print('device',device,flush=True)
start=time.time()
if sys.argv[1]=='depth-pro':
 from transformers import DepthProForDepthEstimation, DepthProImageProcessor
 model_id='apple/DepthPro-hf'
 revision='de816c8ce7168afcb231f96d501d72b869d0beda'
 processor=DepthProImageProcessor.from_pretrained(model_id,revision=revision)
 model=DepthProForDepthEstimation.from_pretrained(model_id,revision=revision,use_safetensors=True,attn_implementation='sdpa',dtype=torch.float16 if device=="mps" else torch.float32).to(device).eval()
 print('Depth Pro loaded',flush=True)
 inputs=processor(images=image,return_tensors='pt').to(device=device,dtype=model.dtype)
 with torch.inference_mode(): output=model(**inputs)
 depth=processor.post_process_depth_estimation(output,target_sizes=[(image.height,image.width)])[0]['predicted_depth'].float().cpu().numpy()
 np.save(OUT/'depth-pro-metric.npy',depth)
 inv=1/np.maximum(depth,.001);inv=(inv-inv.min())/(inv.max()-inv.min())
 Image.fromarray(np.round(inv*65535).astype(np.uint16)).save(OUT/'depth-pro-depth-16.png')
 Image.fromarray(np.round(inv*255).astype(np.uint8)).save(OUT/'depth-pro-depth.png')
 metadata={'crop': list(box) if '--crop' in sys.argv else None,'model':model_id,'revision':revision,'device':device,'input':list(inputs['pixel_values'].shape),'raw_output':list(output.predicted_depth.shape),'seconds':time.time()-start}
else:
 from diffusers import MarigoldNormalsPipeline
 model_id='prs-eth/marigold-normals-v1-1'
 revision='09cfdd258cb281fa006cf1afcd2284376d16687d'
 pipe=MarigoldNormalsPipeline.from_pretrained(model_id,revision=revision,variant='fp16',torch_dtype=torch.float16).to(device)
 pipe.enable_attention_slicing()
 print('Marigold loaded',flush=True)
 with torch.inference_mode():
  output=pipe(image,num_inference_steps=4,ensemble_size=3,processing_resolution=1024,match_input_resolution=True,generator=torch.Generator(device='cpu').manual_seed(42))
 normals=output.prediction[0]
 np.save(OUT/'marigold-normals.npy',normals)
 pipe.image_processor.visualize_normals(output.prediction)[0].save(OUT/'marigold-normals.png')
 metadata={'crop': list(box) if '--crop' in sys.argv else None,'model':model_id,'revision':revision,'device':device,'processing_resolution':1024,'steps':4,'ensemble':3,'seed':42,'seconds':time.time()-start,'coordinates':'X right, Y up, Z toward viewer'}
(OUT/f'{sys.argv[1]}-run.json').write_text(json.dumps(metadata,indent=2))
print(metadata,flush=True)
