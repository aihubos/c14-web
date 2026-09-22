import assert from 'node:assert/strict';
import * as T from '../assets/planner-vendor/three.module.js';
import {fitFurniture} from '../planner-3d.mjs';
const g=new T.Group();const body=new T.Mesh(new T.BoxGeometry(2,1,1),new T.MeshBasicMaterial());body.position.set(3,2,1);g.add(body);const handle=new T.Mesh(new T.BoxGeometry(.1,.1,.2));handle.position.set(3,2,1.6);g.add(handle);
fitFurniture(g,2.3,.85,1.2,T);const b=new T.Box3().setFromObject(g),size=b.getSize(new T.Vector3());for(const [a,e]of [[size.x,2.3],[size.y,.85],[size.z,1.2],[b.min.y,0]])assert(Math.abs(a-e)<1e-6);assert.throws(()=>fitFurniture(g,0,1,1,T));console.log('PASS: detailed model including protrusions fits entered furniture dimensions');
