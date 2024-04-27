package com.example.demo_springai;


import com.theokanning.openai.audio.CreateTranscriptionRequest;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
public class TranscriptionController {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;


    @PostMapping("/audio")
    public String handleFileUpload(@RequestParam("file") MultipartFile file) {
        OpenAiService service = new OpenAiService(apiKey);

        // 假设file可以直接转换成你需要的File对象
        String filePath = saveUploadedFile(file);  // 保存文件并获取路径
        CreateTranscriptionRequest request = new CreateTranscriptionRequest();
        request.setModel("whisper-1");
        String transcription = service.createTranscription(request, filePath).getText();
        return transcription;
    }

    private String saveUploadedFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        File targetFile = new File("/Users/xiaoxiao/IdeaProjects/demo_springAI/src/main/resources/speech/" + fileName);
        try {
            file.transferTo(targetFile);
            return targetFile.getAbsolutePath();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }



}
