document.addEventListener('DOMContentLoaded', () => {
    const cardInner = document.querySelector('.card-inner');
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
    const cardFront = document.querySelector('.card-front');

    let flashcards = [];
    let currentCardIndex = 0;
    let doneCards = JSON.parse(localStorage.getItem('doneCards')) || [];

    function flipCard() {
        cardInner.classList.toggle('flipped');
    }

    flipBtnFront.addEventListener('click', flipCard);
    flipBtnBack.addEventListener('click', flipCard);

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
            flashcards = parseCSV(csvData);
            if (flashcards.length > 0) {
                showCard(currentCardIndex);
            }
        } catch (error) {
            console.error('Error loading flashcards:', error);
            frontWord.textContent = 'Could not load flashcards.';
        }
    }

    function showCard(index) {
        if (flashcards.length === 0) return;
        // Reset flip state for new card
        if (cardInner.classList.contains('flipped')) {
            cardInner.classList.remove('flipped');
        }
        
        const cardData = flashcards[index];
        const uniqueId = cardData['front_word'];

        frontWord.textContent = uniqueId;
        frontSentence.textContent = cardData['front_sentence'];
        frontQuote.textContent = cardData['front_quote'];
        backWord.textContent = cardData['back_word'];
        backSentence.textContent = cardData['back_sentence'];
        
        // Update done status
        if (doneCards.includes(uniqueId)) {
            cardFront.classList.add('done');
            doneBtn.classList.add('done');
            doneBtn.textContent = '✓ Marked as done';
        } else {
            cardFront.classList.remove('done');
            doneBtn.classList.remove('done');
            doneBtn.textContent = 'Mark as done';
        }

        updateButtons();
    }

    function updateButtons() {
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex === flashcards.length - 1;
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
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            showCard(currentCardIndex);
        }
    });

    doneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uniqueId = flashcards[currentCardIndex]['front_word'];
        const isDone = doneCards.includes(uniqueId);

        if (isDone) {
            doneCards = doneCards.filter(id => id !== uniqueId);
            cardFront.classList.remove('done');
            doneBtn.classList.remove('done');
            doneBtn.textContent = 'Mark as done';
        } else {
            doneCards.push(uniqueId);
            cardFront.classList.add('done');
            doneBtn.classList.add('done');
            doneBtn.textContent = '✓ Marked as done';
        }
        localStorage.setItem('doneCards', JSON.stringify(doneCards));
    });

    loadFlashcards();
}); 