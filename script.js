document.addEventListener('DOMContentLoaded', () => {
    const cardInner = document.querySelector('.card-inner');
    const flashcardContainer = document.getElementById('flashcard-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const doneBtn = document.getElementById('done-btn');
    const flipBtnFront = document.querySelector('.flip-btn-front');
    const flipBtnBack = document.querySelector('.flip-btn-back');

    // Card face elements
    const frontWord = document.getElementById('front-word');
    const frontSentence = document.getElementById('front-sentence');
    const frontQuote = document.getElementById('front-quote');
    const backWord = document.getElementById('back-word');
    const backSentence = document.getElementById('back-sentence');
    
    // Card state elements
    const cardBack = document.querySelector('.card-back');
    const themeColorMeta = document.getElementById('theme-color');
    const studyModeToggle = document.getElementById('study-mode-toggle');

    let allFlashcards = [];
    let displayedFlashcards = [];
    let currentCardIndex = 0;
    let doneCards = JSON.parse(localStorage.getItem('doneCards')) || [];
    let isReviewingAll = false;

    function updateThemeColor() {
        const isFlipped = cardInner.classList.contains('flipped');
        const isDone = cardBack.classList.contains('done');
        let newColor;

        if (isFlipped) {
            newColor = isDone ? '#4ade80' : '#f87171';
        } else {
            newColor = '#fcd34d';
        }
        themeColorMeta.content = newColor;
        document.body.style.backgroundColor = newColor;
    }

    function flipCard() {
        cardInner.classList.toggle('flipped');
        updateThemeColor();
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    flipBtnFront.addEventListener('click', flipCard);
    flipBtnBack.addEventListener('click', flipCard);

    function filterAndDisplayCards() {
        isReviewingAll = studyModeToggle.checked;
        if (isReviewingAll) {
            displayedFlashcards = allFlashcards;
        } else {
            displayedFlashcards = allFlashcards.filter(card => !doneCards.includes(card.front_word));
        }
        
        // If the filtered list is empty, show a message or handle it gracefully
        if (displayedFlashcards.length === 0) {
            // This is a good place to add a "You've learned everything!" message
            // For now, we'll just show the full list again to avoid a blank screen
            if (!isReviewingAll) {
                displayedFlashcards = allFlashcards;
            }
        }
        
        currentCardIndex = 0;
        showCard(currentCardIndex);
    }

    function parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(v => v.trim().replace(/"/g, ''));
            let obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i];
            });
            return obj;
        });
        return data;
    }

    async function loadFlashcards() {
        try {
            const response = await fetch('flashcards.csv');
            const csvData = await response.text();
            allFlashcards = parseCSV(csvData);
            if (allFlashcards.length > 0) {
                filterAndDisplayCards();
            }
        } catch (error) {
            console.error('Error loading flashcards:', error);
            frontWord.textContent = 'Could not load flashcards.';
        }
    }

    function showCard(index) {
        if (displayedFlashcards.length === 0) {
            // Handle case where there are no cards to show
            frontWord.textContent = 'All cards learned! Toggle "Review All" to see them again.';
            backWord.textContent = 'Congratulations!';
            // You might want to hide other elements here
            updateButtons();
            return;
        }
        
        const cardData = displayedFlashcards[index];
        const uniqueId = cardData['front_word'];

        frontWord.textContent = uniqueId;
        frontSentence.textContent = cardData['front_sentence'];
        frontQuote.textContent = cardData['front_quote'];
        backWord.textContent = cardData['back_word'];
        backSentence.textContent = cardData['back_sentence'];
        
        // Update done status
        if (doneCards.includes(uniqueId)) {
            cardBack.classList.add('done');
            doneBtn.classList.add('done');
            doneBtn.textContent = 'Marked as done';
        } else {
            cardBack.classList.remove('done');
            doneBtn.classList.remove('done');
            doneBtn.textContent = 'Mark as done';
        }

        updateButtons();
        updateThemeColor();
    }

    function updateButtons() {
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === displayedFlashcards.length - 1;
    }

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            showCard(currentCardIndex);
        }
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCardIndex < displayedFlashcards.length - 1) {
            currentCardIndex++;
            showCard(currentCardIndex);
        }
    });

    doneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uniqueId = displayedFlashcards[currentCardIndex]['front_word'];
        const isDone = doneCards.includes(uniqueId);

        if (isDone) {
            doneCards = doneCards.filter(id => id !== uniqueId);
            cardBack.classList.remove('done');
            doneBtn.classList.remove('done');
            doneBtn.textContent = 'Mark as done';
        } else {
            doneCards.push(uniqueId);
            cardBack.classList.add('done');
            doneBtn.classList.add('done');
            doneBtn.textContent = 'Marked as done';
        }
        localStorage.setItem('doneCards', JSON.stringify(doneCards));
        updateThemeColor();
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // If not in review mode, removing the last card requires re-filtering
        if (!isReviewingAll) {
            // A brief delay allows the user to see the "done" animation
            setTimeout(filterAndDisplayCards, 300);
        }
    });

    // --- Swipe Gestures ---
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe in pixels
        if (touchEndX < touchStartX - swipeThreshold) {
            nextBtn.click(); // Swiped left
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            prevBtn.click(); // Swiped right
        }
    }

    flashcardContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    flashcardContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    studyModeToggle.addEventListener('change', filterAndDisplayCards);
    loadFlashcards();
}); 