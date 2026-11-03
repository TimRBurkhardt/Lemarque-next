"""Pack aligned suit-view masks, Marigold surface normals and Depth Pro normals for the hero."""
from pathlib import Path
import json,sys
import cv2
import numpy as np
from PIL import Image
look=sys.argv[1]
assert look in ['suit-turn-right','suit-turn-back','suit-turn-left']
O=Path('public/collections/malum/hero/interactive')
R=Path(f'design/malum-interactive/{look}-hybrid/model-crop')
x0,_,x1,_=json.loads((R/'depth-pro-run.json').read_text())['crop']
a=np.array(Image.open(O/f'{look}.webp').getchannel('A'));h,w=a.shape
m=a.astype(np.float32)/255
soft=cv2.GaussianBlur(m,(0,0),2.0)
Image.fromarray(np.round(np.stack([m,m,soft],-1)*255).astype(np.uint8)).save(O/f'{look}-hybrid-packed.png')
conf=cv2.GaussianBlur(cv2.erode(m,np.ones((15,15),np.uint8)),(0,0),2)
mar=np.load(R/'marigold-normals.npy');mar[:,:,1]*=-1
full=np.zeros((h,w,3),np.float32);full[:,:,2]=1;full[:,x0:x1]=mar
full/=np.maximum(np.linalg.norm(full,axis=-1,keepdims=True),1e-6)
def packed(n,c,name):Image.fromarray(np.round(np.clip(np.dstack([n[:,:,:2]*.5+.5,c]),0,1)*255).astype(np.uint8)).save(O/f'{look}-{name}')
packed(full,conf,'hybrid-normal.png')
Image.fromarray(np.round((full*.5+.5)*255).astype(np.uint8)).save(R/'hybrid-normal-preview.png')
d=np.load(R/'depth-pro-metric.npy');q=1/np.maximum(d,.001);q=(q-q.min())/(q.max()-q.min());q=cv2.GaussianBlur(q,(0,0),2)
dy,dx=np.gradient(q);n=np.stack([-dx*140,-dy*140,np.ones_like(dx)],-1);n/=np.linalg.norm(n,axis=-1,keepdims=True)
b=np.zeros((h,w,3),np.float32);b[:,:,2]=1;b[:,x0:x1]=n
packed(b,m,'hybrid-depth-normal.png')

print('Built',look)
