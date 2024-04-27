new Vue({
    el: '#app',
    data: {
        messages: [],
        userInput: '',
        eventSource: null,
        recordingStatus: 'Not recording',
        mediaRecorder: null,
        audioChunks: []
    },
    mounted() {
        this.initializeMediaRecorder();
    },
    methods: {
        sendMessage() {
            if (this.userInput.trim() !== '') {
                const message = this.userInput;
                this.messages.push({ who: 'user', text: message });
                this.initializeEventSource(message);
                this.userInput = '';
            }
        },
        sendUserMessages() {
            const userMessages = this.messages.filter(msg => msg.who === 'user').map(msg => `- ${msg.text}`);
            if (userMessages.length > 0) {
                const userMessagesString = userMessages.join('\n'); // Join all formatted messages with a newline

                this.messages.push({ who: 'user', text: "Now, please help me correct my oral English." });
                this.initializeEventSource(userMessagesString,'http://localhost:8081/ai/analyseOralController?message=' + encodeURIComponent(userMessagesString));
            } else {
                console.log("No user messages to analyse.");
            }
        },
        initializeEventSource(message,url='http://localhost:8081/ai/generateStream?message=' + encodeURIComponent(message)) {
            if (this.eventSource) {
                this.eventSource.close(); // Close any existing stream before opening a new one
            }
            this.eventSource = new EventSource(url);
            this.eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Received data:', data);
                this.processStreamData(data);
            };
            this.eventSource.onerror = (event) => {
                console.log('EventSource failed:', event);
                this.eventSource.close();
            };
        },

        processStreamData(data) {
            if (typeof data === 'object' && data !== null) {
                // Handle data as an object
                // console.log('Received object data:', data);
                this.handleObjectData(data);
                // 打印data类型
                console.log('data type:', typeof data);
                console.log('messages:', this.messages);
            } else {
                // Handle data as a primitive type or unsupported type
                console.error('Unexpected data type:', typeof data);
            }
        },
        handleObjectData(dataObject) {
            if (dataObject.result && dataObject.result.output && dataObject.result.output.content) {
                // const content = dataObject.result.output.content.trim();
                const content = dataObject.result.output.content;
                console.log('Received content:', content);
                // 添加或更新最新的AI消息
                if (this.messages.length === 0 || this.messages[this.messages.length - 1].who !== 'ai') {
                    // 如果消息数组为空或最后一条消息不是AI的，则开始新的消息
                    this.messages.push({ who: 'ai', text: content });
                } else {
                    // 否则更新最后一条AI消息
                    // this.messages[this.messages.length - 1].text += ' ' + content;
                    this.messages[this.messages.length - 1].text += content;
                }
            }
        },
        initializeMediaRecorder() {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.mediaRecorder.ondataavailable = event => {
                        this.audioChunks.push(event.data);
                    };
                    this.mediaRecorder.onstop = this.handleAudioStop;
                })
                .catch(error => console.error('Error accessing media devices.', error));
        },
        startRecording() {
            if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
                this.mediaRecorder.start();
                this.recordingStatus = 'Recording...';
            }
        },
        stopRecording() {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                this.recordingStatus = 'Not recording';
            }
        },
        handleAudioStop() {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
            this.audioChunks = [];
            this.uploadAudio(audioBlob);
        },
        uploadAudio(audioBlob) {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.mp3');

            fetch('http://localhost:8081/audio', {
                method: 'POST',
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    this.messages.push({ who: 'user', text: data });
                    this.initializeEventSource(data)  // 再次从前端调用，有点绕，但最简单了
                })
                .catch(error => {
                    console.error('Error uploading audio:', error);
                });
        }
    },
    beforeDestroy() {
        if (this.eventSource) {
            this.eventSource.close(); // Properly close the EventSource when the component is destroyed
        }
    }
});



// new Vue({
//     el: '#app',
//     data: {
//         messages: [],
//         userInput: ''
//     },
//     methods: {
//         sendMessage() {
//             if (this.userInput.trim() !== '') {
//                 const message = this.userInput;
//                 this.messages.push({ who: 'user', text: message });
//                 axios.get(`http://localhost:8081/ai/generate`, {
//                     params: { message: message }
//                 })
//                     .then(response => {
//                         this.messages.push({ who: 'ai', text: response.data.generation });
//                     })
//                     .catch(error => console.error('Error:', error));
//                 this.userInput = '';
//             }
//         }
//     }
// });
