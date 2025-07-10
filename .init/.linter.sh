#!/bin/bash
cd /home/kavia/workspace/code-generation/human-behavior-mimicry-chatbot-8914c2da/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

