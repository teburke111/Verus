#!/bin/bash
set -e

cd ~/Verus/k8s || { echo "Directory ~/Verus/k8s not found"; exit 1; }

echo "=== Step 1: Applying backend and frontend YAMLs ==="
kubectl apply -f backend-audio-process-deployment.yaml
kubectl apply -f backend-audio-process-service.yaml
kubectl apply -f mongo-deployment.yaml
kubectl apply -f backend-image-predict-deployment.yaml
kubectl apply -f backend-image-predict-service.yaml
kubectl apply -f backend-image-process-deployment.yaml
kubectl apply -f backend-image-process-service.yaml
kubectl apply -f backend-text-predict-deployment.yaml
kubectl apply -f backend-text-predict-service.yaml
kubectl apply -f backend-text-process-deployment.yaml
kubectl apply -f backend-text-process-service.yaml
kubectl apply -f backend-video-predict-deployment.yaml
kubectl apply -f backend-video-predict-service.yaml
kubectl apply -f backend-video-process-deployment.yaml
kubectl apply -f backend-video-process-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f ingress.yaml

echo "=== Step 2: Waiting for at least one backend pod to be ready ==="
kubectl wait --for=condition=ready pod -l app=mongo --timeout=300s

echo "=== Step 3: Applying MongoDB deployment ==="
kubectl apply -f backend-deployment.yaml

echo "=== Step 4: Waiting for all pods to be ready ==="
kubectl wait --for=condition=ready pod --all --timeout=600s

echo "=== Frontend access information ==="
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
NODEPORT=$(kubectl get svc frontend-service -o jsonpath='{.spec.ports[0].nodePort}')

echo "Access your website at: http://$NODE_IP:$NODEPORT"

echo "=== Deployment complete! ==="
