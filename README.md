## <img src="logo/logo.png" alt="Verus Logo" width="80" /> 


## Table of Contents
- [Overview](#Overview)
- [Features](#features)

## Overview 
The **Deepfake & Synthetic Media Detector** is a cloud-native, Kubernetes-based application designed to detect AI-generated or manipulated content across multiple media types: 
- Text
- Audio
- Image
- Video<br> 
The system integrates a React frontend, a Flask API backend, and distributed microservices for preprocessing, inference, persistence (via mongoDB), and authentication.

## Features
- Upload and analyze text, image, audio, or video files.
- Multi-model inference pipeline (per media type).
- JWT-secured authentication and user account system.
- Persistent history and storage quotas per user.
- React frontend with Flask API backend.
- Kubernetes microservices with autoscaling.
- MongoDB for results, metadata, and user data.
- Daily backup & failover support.


