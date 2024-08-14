document.addEventListener('DOMContentLoaded', () => {
    // Existing elements
    const form = document.getElementById('quest-form');
    const input = document.getElementById('quest-input');
    const questList = document.getElementById('quest-list');
    const bgMusic = document.getElementById('bgMusic');
    const toggleMusicBtn = document.getElementById('toggleMusic');
    const bgVideo = document.getElementById('bgVideo');
    const completionVideo = document.getElementById('completionVideo');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const cursor = document.getElementById('custom-cursor');
   
    // New elements for timed tasks
    const timedTaskForm = document.getElementById('timed-task-form');
    const timedTaskInput = document.getElementById('timed-task-input');
    const timedTaskTime = document.getElementById('timed-task-time');
    const timedTaskDuration = document.getElementById('timed-task-duration');
    const timedTaskList = document.getElementById('timed-task-list');

    const soundEffect = new Audio('sound1.mp3');
    const completionSound = new Audio('task_complete.mp3');
    const closeSound = new Audio('close_sound.mp3');

    const timedTasksContainer = document.querySelector('.timed-tasks-container');
    const closeBtn = document.querySelector('.close-btn');

    const defaultQuests = {
        sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: []
    };

    const enlargedTask = document.getElementById('enlarged-task');
    const enlargedTaskName = document.getElementById('enlarged-task-name');
    const enlargedTaskCountdown = document.getElementById('enlarged-task-countdown');
    const closeEnlargedTaskBtn = document.getElementById('close-enlarged-task');

    let activeTaskId = null;

    let quests = JSON.parse(localStorage.getItem('saoQuests')) || defaultQuests;
    let timedTasks = JSON.parse(localStorage.getItem('saoTimedTasks')) || [];
    let currentDay = 'sunday';

    // Custom cursor functionality
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.9)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });

    // Save functions
    const saveQuests = () => {
        localStorage.setItem('saoQuests', JSON.stringify(quests));
    };

    const saveTimedTasks = () => {
        localStorage.setItem('saoTimedTasks', JSON.stringify(timedTasks));
    };

    // Render functions
    const renderQuests = () => {
        questList.innerHTML = '';
        quests[currentDay].forEach((quest, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="quest-text" data-index="${index}" contenteditable="true">${quest.text}</span>
                <select class="priority-select" data-index="${index}" data-priority="${quest.priority}">
                    <option value="image1" ${quest.priority === 'image1' ? 'selected' : ''}>Low</option>
                    <option value="image2" ${quest.priority === 'image2' ? 'selected' : ''}>Medium</option>
                    <option value="image3" ${quest.priority === 'image3' ? 'selected' : ''}>High</option>
                </select>
                <button class="complete-btn" data-index="${index}">Complete</button>
            `;
            questList.appendChild(li);
        });
    };

    const renderTimedTasks = () => {
        timedTaskList.innerHTML = '';
        timedTasks.forEach((task) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <span>Start: ${task.startTime}</span>
                <span class="duration-display">Duration: ${task.duration} minutes</span>
                <span class="countdown" style="display: none;"></span>
                <button class="delete-timed-task" data-id="${task.id}">Delete</button>
            `;
            timedTaskList.appendChild(li);
        });
    };

    // Helper functions
    const playSound = (audio) => {
        audio.currentTime = 0;
        audio.play().catch(error => console.log("Sound play prevented:", error));
    };

    const playCompletionVideo = () => {
        bgVideo.style.opacity = '0';
        completionVideo.style.display = 'block';
        completionVideo.style.opacity = '1';
        completionVideo.currentTime = 0;
        completionVideo.play().catch(error => console.error("Completion video play prevented:", error));
    };

    // Event listeners for quests
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newQuestText = input.value.trim();
        if (newQuestText) {
            quests[currentDay].push({ text: newQuestText, priority: 'image1' });
            playSound(soundEffect);
            input.value = '';
            saveQuests();
            renderQuests();
        }
    });

    questList.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-btn')) {
            const index = parseInt(e.target.dataset.index);
            quests[currentDay].splice(index, 1);
            playSound(soundEffect);
            saveQuests();
            renderQuests();

            if (quests[currentDay].length === 0) {
                playSound(completionSound);
                playCompletionVideo();
            }
        }
    });

    questList.addEventListener('blur', (e) => {
        if (e.target.classList.contains('quest-text')) {
            const index = parseInt(e.target.dataset.index);
            const newText = e.target.textContent.trim();
            if (newText !== '') {
                quests[currentDay][index].text = newText;
                saveQuests();
            } else {
                renderQuests(); // Revert to original text if empty
            }
        }
    }, true);

    questList.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('quest-text') && e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    });

    questList.addEventListener('change', (e) => {
        if (e.target.classList.contains('priority-select')) {
            const index = parseInt(e.target.dataset.index);
            const newPriority = e.target.value;
            quests[currentDay][index].priority = newPriority;
            e.target.setAttribute('data-priority', newPriority);
            saveQuests();
        }
    });

    // Event listeners for timed tasks
    timedTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTimedTaskText = timedTaskInput.value.trim();
        const newTimedTaskTime = timedTaskTime.value;
        const newTimedTaskDuration = parseInt(timedTaskDuration.value);
    
        if (newTimedTaskText && newTimedTaskTime && newTimedTaskDuration) {
            const newTask = {
                id: Date.now().toString(),
                text: newTimedTaskText,
                startTime: newTimedTaskTime,
                duration: newTimedTaskDuration,
                hasBeenClosed: false
            };
            timedTasks.push(newTask);
            playSound(soundEffect);
            timedTaskInput.value = '';
            timedTaskTime.value = '';
            timedTaskDuration.value = '';
            saveTimedTasks();
            renderTimedTasks();
            animateContainerResize();
        }
    });

    timedTaskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-timed-task')) {
            const taskId = e.target.dataset.id;
            const index = timedTasks.findIndex(task => task.id === taskId);
            if (index !== -1) {
                timedTasks.splice(index, 1);
                playSound(soundEffect);
                saveTimedTasks();
                renderTimedTasks();
                animateContainerResize();
            }
        }
    });

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentDay = button.dataset.day;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderQuests();
        });
    });

    // Music toggle
    toggleMusicBtn.addEventListener('click', () => {
        playSound(soundEffect);
        if (bgMusic.paused) {
            bgMusic.play();
            toggleMusicBtn.textContent = 'Pause Music';
        } else {
            bgMusic.pause();
            toggleMusicBtn.textContent = 'Play Music';
        }
    });

    // Video event listener
    completionVideo.addEventListener('ended', () => {
        completionVideo.style.opacity = '0';
        setTimeout(() => {
            completionVideo.style.display = 'none';
            bgVideo.style.opacity = '1';
        }, 500);
    });

    // Clock functionality
    function updateClock() {
        const now = new Date();
        const options = {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        };
        const timeString = now.toLocaleTimeString('en-US', options);
       
        document.getElementById('hours').textContent = timeString.slice(0, 2);
        document.getElementById('minutes').textContent = timeString.slice(3, 5);
       
        document.getElementById('separator').classList.toggle('blink');

        const dayOptions = { weekday: 'long' };
        const dayString = now.toLocaleDateString('en-US', dayOptions);
        document.getElementById('day').textContent = dayString.toUpperCase();
    }

    // Voice Recognition Setup
    console.log("Setting up voice recognition");
    const voiceButton = document.createElement('button');
    voiceButton.textContent = 'Start Voice Recognition';
    voiceButton.id = 'voiceRecognitionButton';
    voiceButton.style.position = 'fixed';
    voiceButton.style.bottom = '20px';
    voiceButton.style.left = '20px';
    voiceButton.style.zIndex = '1000';
    document.body.appendChild(voiceButton);
    console.log("Voice button created:", voiceButton);

    voiceButton.addEventListener('click', async () => {
        console.log('Voice button clicked');
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            console.error('Speech Recognition API is not supported in this browser');
            alert('Speech Recognition is not supported in this browser. Please try using Google Chrome.');
            return;
        }
        
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            startVoiceRecognition();
        } catch (err) {
            console.error('Microphone permission denied:', err);
            alert('Microphone permission is required for voice recognition.');
        }
    });

    function startVoiceRecognition() {
        console.log('Starting voice recognition');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = function() {
            console.log('Voice recognition started');
            voiceButton.textContent = 'Listening...';
        };

        recognition.onresult = function(event) {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.trim().toLowerCase();
            console.log('Recognized command:', command);

            if (command === "time") {
                showLargeTime();
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            voiceButton.textContent = 'Start Voice Recognition';
        };

        recognition.onend = function() {
            console.log('Voice recognition ended');
            voiceButton.textContent = 'Start Voice Recognition';
        };

        try {
            recognition.start();
            console.log('Recognition.start() called');
        } catch (err) {
            console.error('Error starting recognition:', err);
        }
    }

    function showLargeTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const largeTimeDisplay = document.createElement('div');
        largeTimeDisplay.id = 'largeTimeDisplay';
        largeTimeDisplay.textContent = timeString;
        document.body.appendChild(largeTimeDisplay);

        setTimeout(() => {
            largeTimeDisplay.remove();
        }, 5000);
    }

    const removeTimedTask = (index) => {
        const task = timedTasks[index];
        if (task && task.timerId) {
            clearInterval(task.timerId);
        }
        timedTasks.splice(index, 1);
        saveTimedTasks();
        renderTimedTasks();
        animateContainerResize();
        hideEnlargedTask();
    };

    
    const animateContainerResize = () => {
        const container = document.querySelector('.timed-tasks-container');
        container.style.transition = 'height 0.5s ease-in-out';
        container.style.height = container.scrollHeight + 'px';
        
        setTimeout(() => {
            container.style.height = 'auto';
            container.style.transition = '';
        }, 500);
    };

    const checkTimedTasks = () => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        
        timedTasks.forEach((task, index) => {
            const taskElement = timedTaskList.children[index];
            if (!taskElement) return;
            
            const startTime = new Date(now.toDateString() + ' ' + task.startTime);
            const endTime = new Date(startTime.getTime() + task.duration * 60000);
    
            if (currentTime === task.startTime && !task.hasBeenClosed) {
                playSound(soundEffect);
                taskElement.classList.add('active-task');
                timedTasksContainer.classList.add('active');
                updateCountdown(taskElement, endTime, task.id);
                showEnlargedTask(task.text, task.id);
            }
        });
    };

    timedTaskList.addEventListener('click', (e) => {
        const taskElement = e.target.closest('li');
        if (taskElement) {
            const taskId = taskElement.querySelector('.delete-timed-task').dataset.id;
            const task = timedTasks.find(t => t.id === taskId);
            if (task) {
                showEnlargedTask(task.text, task.id);
            }
        }
    });

    closeEnlargedTaskBtn.addEventListener('click', () => {
        playSound(closeSound);  // Play the new close sound
        hideEnlargedTask();
    });

    closeBtn.addEventListener('click', () => {
        timedTasksContainer.classList.remove('active');
    });
    
    updateClock();
    setInterval(updateClock, 500);
    setInterval(checkTimedTasks, 1000);
    bgMusic.play().catch(() => toggleMusicBtn.textContent = 'Play Music');
    tabButtons[0].classList.add('active');
    renderQuests();
    renderTimedTasks();

    
});
