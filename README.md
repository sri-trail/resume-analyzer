AI Resume Analyzer

An AI-powered Resume Analyzer web application that allows users to upload resumes (PDF/DOCX) and receive intelligent feedback on content quality, skills alignment, and improvement suggestions.

This project demonstrates backend API development, file handling, AI integration, and privacy-focused design.

Project Overview

The AI Resume Analyzer is a full-stack web application designed to:

Upload resumes securely

Extract text from PDF and DOCX files

Analyze resume content using AI

Provide structured feedback and improvement suggestions

Maintain user data privacy

This project was built to showcase practical AI integration with Node.js and modern web technologies.

Tech Stack
Backend

Node.js

Express.js

Multer (file upload handling)

pdf-parse (PDF text extraction)

Mammoth (DOCX text extraction)

AI API Integration (Hugging Face / OpenAI based)

Environment variable security using dotenv

Frontend

React.js

CSS

Axios (API communication)

Deployment

Render (Backend hosting)

Static frontend deployment

Features

Resume upload (PDF & DOCX)

Server-side file processing

AI-generated resume feedback

Skill improvement suggestions

Basic privacy-focused architecture

Clean UI for user interaction

How It Works

User uploads resume file.

Backend extracts resume text.

Extracted text is sent to AI API.

AI analyzes resume and returns feedback.

Structured feedback is displayed on the dashboard.

Project Structure
backend
  /controllers
  /routes
  /uploads
  server.js

frontend
  /components
  app.js

Privacy & Security

Uploaded resumes are processed server-side.

No long-term storage of resume data.

API keys stored securely using environment variables.

Designed with minimal data retention.

Purpose of This Project

This project was built to demonstrate:

AI integration into real-world applications

Backend API development

Secure file handling

Clean full-stack architecture

Practical implementation of resume analysis logic

Future Enhancements (Optional)

Resume scoring system

Skill gap analysis

Job-role-based resume optimization

Authentication system

Improved UI/UX
