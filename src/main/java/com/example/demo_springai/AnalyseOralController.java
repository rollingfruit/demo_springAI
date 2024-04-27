package com.example.demo_springai;

import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.Map;

@RestController
public class AnalyseOralController {

    private final OpenAiChatClient chatClient;

//    ChatService chatService = new ChatService();
    @Autowired
    public AnalyseOralController(OpenAiChatClient chatClient) {
        this.chatClient = chatClient;
    }


    @GetMapping("/ai/analyseOralController")
    public Flux<ChatResponse> analyseOralController(@RequestParam(value = "message", defaultValue = "Help me analyze my oral English") String message) {
        String analyseOralPrompt = "请分析下面的英文段落是否有语法错误，并按照以下结构化步骤操作：首先，如果没有检测到语法错误，请表扬用户并表示准备接收下一次输入；其次，如果存在语法错误，请列出每个错误，并跟随一个用引号包裹的简短中文解释，最后给出三个与识别出的错误相关的填空练习题以帮助加强正确用法，附上练习题正确答案。确保所有指示部分都以支持性和教育性的语调呈现。\n ";
        System.out.println("analyseOralPrompt message: " + analyseOralPrompt + message);
        Prompt prompt = new Prompt(new UserMessage(analyseOralPrompt + message));
        Flux<ChatResponse> stream = chatClient.stream(prompt);
        return stream;
    }






}