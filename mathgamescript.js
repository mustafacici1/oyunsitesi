// Oyun durumu ve ayarları
const gameState = {
    maxLevel: 15,
    currentLevel: 1,
    currentScore: 0,
    currentCombo: 0,
    maxCombo: 0,
    hintsLeft: 3,
    skipsLeft: 2,
    currentEquation: null,
    selectedBlank: null,
    gameMode: 'normal', // 'normal' veya 'challenge'
    difficulty: 'medium',
    challengeTimer: 60,
    challengeScore: 0,
    problemsSolved: 0,
    isGameActive: false
  };
  
  // Oyuncu istatistikleri (bellekte saklanır)
  const playerStats = {
    highestLevel: 1,
    totalScore: 0,
    gamesPlayed: 0,
    achievements: []
  };
  
  // Başarım sistemi
  const achievements = {
    firstWin: { name: "İlk Zafer", desc: "İlk seviyeyi tamamla", icon: "🏆" },
    speedster: { name: "Hızlı Beyin", desc: "5 saniyede cevapla", icon: "⚡" },
    comboMaster: { name: "Kombo Ustası", desc: "5x kombo yap", icon: "🔥" },
    mathWizard: { name: "Matematik Büyücüsü", desc: "10. seviyeye ulaş", icon: "🧙‍♂️" },
    perfectionist: { name: "Mükemmeliyetçi", desc: "Hiç hata yapmadan 5 seviye", icon: "💎" },
    timeWarrior: { name: "Zaman Savaşçısı", desc: "Zaman yarışında 50 puan", icon: "⏰" },
    calculator: { name: "Hesap Makinesi", desc: "100 problem çöz", icon: "🧮" }
  };
  
  // DOM elemanları
  const screens = {
    menu: document.getElementById('menu-screen'),
    howto: document.getElementById('howto-screen'),
    settings: document.getElementById('settings-screen'),
    game: document.getElementById('game-screen'),
    challenge: document.getElementById('challenge-screen'),
    results: document.getElementById('results-screen')
  };
  
  // Event listener'ları
  document.getElementById('play-btn').onclick = () => startGame('normal');
  document.getElementById('challenge-btn').onclick = () => startGame('challenge');
  document.getElementById('howto-btn').onclick = () => switchScreen('howto');
  document.getElementById('settings-btn').onclick = () => switchScreen('settings');
  document.querySelectorAll('.back-btn').forEach(btn => btn.onclick = () => switchScreen('menu'));
  
  document.getElementById('submit-btn').onclick = () => checkAnswer();
  document.getElementById('challenge-submit-btn').onclick = () => checkChallengeAnswer();
  document.getElementById('clear-btn').onclick = () => clearBlanks();
  document.getElementById('challenge-clear-btn').onclick = () => clearChallengeBlanks();
  document.getElementById('hint-btn').onclick = () => useHint();
  document.getElementById('skip-btn').onclick = () => skipLevel();
  
  document.getElementById('play-again-btn').onclick = () => startGame(gameState.gameMode);
  document.getElementById('menu-return-btn').onclick = () => switchScreen('menu');
  
  document.getElementById('sound-toggle').onchange = e => updateSetting('sound', e.target.checked);
  document.getElementById('music-toggle').onchange = e => updateSetting('music', e.target.checked);
  document.getElementById('vibration-toggle').onchange = e => updateSetting('vibration', e.target.checked);
  document.getElementById('difficulty-select').onchange = e => updateSetting('difficulty', e.target.value);
  document.getElementById('reset-progress').onclick = () => resetProgress();
  
  // Ekran geçişi
  function switchScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
    
    if (screenName === 'menu') {
      updateMenuStats();
    }
  }
  
  // Oyunu başlat
  function startGame(mode) {
    gameState.gameMode = mode;
    gameState.currentLevel = 1;
    gameState.currentScore = 0;
    gameState.currentCombo = 0;
    gameState.maxCombo = 0;
    gameState.hintsLeft = 3;
    gameState.skipsLeft = 2;
    gameState.isGameActive = true;
    
    if (mode === 'challenge') {
      gameState.challengeTimer = 60;
      gameState.challengeScore = 0;
      gameState.problemsSolved = 0;
      switchScreen('challenge');
      startChallengeMode();
    } else {
      switchScreen('game');
      startLevel();
    }
  }
  
  // Normal mod seviye başlat
  function startLevel() {
    document.getElementById('level-number').textContent = gameState.currentLevel;
    document.getElementById('max-level').textContent = gameState.maxLevel;
    document.getElementById('current-score').textContent = gameState.currentScore;
    document.getElementById('hint-count').textContent = gameState.hintsLeft;
    document.getElementById('skip-count').textContent = gameState.skipsLeft;
    
    updateComboDisplay();
    updateProgressBar();
    
    gameState.currentEquation = generateEquation(gameState.currentLevel);
    renderEquation(gameState.currentEquation, 'equation');
    renderNumbers(gameState.currentEquation.numbers, 'numbers-pool');
    
    // Seviye başlangıç zamanını kaydet
    gameState.levelStartTime = Date.now();
  }
  
  // Zaman yarışı modu
  function startChallengeMode() {
    updateChallengeDisplay();
    gameState.currentEquation = generateEquation(Math.min(5, Math.floor(gameState.problemsSolved / 3) + 1));
    renderEquation(gameState.currentEquation, 'challenge-equation');
    renderNumbers(gameState.currentEquation.numbers, 'challenge-numbers-pool');
    
    // Timer başlat
    const timer = setInterval(() => {
      gameState.challengeTimer -= 0.1;
      updateChallengeTimer();
      
      if (gameState.challengeTimer <= 0) {
        clearInterval(timer);
        endChallengeMode();
      }
    }, 100);
  }
  
  // Denklem üretici (geliştirilmiş)
  function generateEquation(level) {
    const difficulty = gameState.difficulty;
    const operations = getOperationsForLevel(level, difficulty);
    
    let termCount = getTermCount(level, difficulty);
    let numbers = [];
    let operators = [];
    
    // Zorluk seviyesine göre sayı aralığı
    const numberRange = getNumberRange(level, difficulty);
    
    // Sayıları üret
    for (let i = 0; i < termCount; i++) {
      numbers.push(Math.floor(Math.random() * numberRange.max) + numberRange.min);
    }
    
    // Operatörleri üret
    for (let i = 0; i < termCount - 1; i++) {
      operators.push(operations[Math.floor(Math.random() * operations.length)]);
    }
    
    let expression = buildExpression(numbers, operators);
    let result = calculateResult(expression);
    
    // Negatif sonuçları engelle
    while (result < 0 || result > 1000 || !Number.isInteger(result)) {
      numbers = [];
      operators = [];
      
      for (let i = 0; i < termCount; i++) {
        numbers.push(Math.floor(Math.random() * numberRange.max) + numberRange.min);
      }
      
      for (let i = 0; i < termCount - 1; i++) {
        operators.push(operations[Math.floor(Math.random() * operations.length)]);
      }
      
      expression = buildExpression(numbers, operators);
      result = calculateResult(expression);
    }
    
    return {
      expression: expression,
      result: result,
      numbers: shuffle([...numbers]),
      originalNumbers: [...numbers],
      operators: operators
    };
  }
  
  function getOperationsForLevel(level, difficulty) {
    const baseOps = ['+', '-'];
    const advancedOps = ['*', '/'];
    
    if (level <= 2) return baseOps;
    if (level <= 5) return [...baseOps, '*'];
    if (difficulty === 'easy') return [...baseOps, '*'];
    if (difficulty === 'hard') return [...baseOps, ...advancedOps, '^', '%'];
    return [...baseOps, ...advancedOps];
  }
  
  function getTermCount(level, difficulty) {
    let base = 2;
    if (level > 3) base = 3;
    if (level > 7) base = 4;
    if (level > 12) base = 5;
    
    if (difficulty === 'easy') return Math.max(2, base - 1);
    if (difficulty === 'hard') return Math.min(6, base + 1);
    return base;
  }
  
  function getNumberRange(level, difficulty) {
    let min = 1, max = 9;
    
    if (level > 5) max = 15;
    if (level > 10) max = 20;
    
    if (difficulty === 'easy') {
      max = Math.min(max, 10);
    } else if (difficulty === 'hard') {
      max = Math.min(max + 10, 50);
      if (level > 8) min = 2;
    }
    
    return { min, max };
  }
  
  function buildExpression(numbers, operators) {
    let expr = '';
    for (let i = 0; i < numbers.length; i++) {
      expr += numbers[i];
      if (i < operators.length) {
        expr += operators[i];
      }
    }
    return expr;
  }
  
  function calculateResult(expression) {
    try {
      // Güvenli eval alternatifi
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
      return Math.floor(eval(sanitized));
    } catch (e) {
      return 0;
    }
  }
  
  // Denklem render
  function renderEquation(equation, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const parts = parseExpression(equation.expression);
    
    parts.forEach((part, index) => {
      if (isNumber(part)) {
        const blank = document.createElement('span');
        blank.className = 'blank';
        blank.dataset.index = index;
        blank.dataset.expectedValue = part;
        blank.onclick = () => selectBlank(blank);
        container.appendChild(blank);
      } else {
        const operator = document.createElement('span');
        operator.textContent = ` ${part} `;
        operator.className = 'operator';
        container.appendChild(operator);
      }
    });
    
    const equals = document.createElement('span');
    equals.textContent = ' = ';
    equals.className = 'operator';
    container.appendChild(equals);
    
    const result = document.createElement('strong');
    result.textContent = equation.result;
    result.className = 'result';
    container.appendChild(result);
  }
  
  function parseExpression(expr) {
    return expr.split(/([+\-*/^%])/).filter(part => part.trim() !== '');
  }
  
  function isNumber(str) {
    return /^\d+$/.test(str.trim());
  }
  
  // Sayıları render et
  function renderNumbers(numbers, poolId) {
    const pool = document.getElementById(poolId);
    pool.innerHTML = '';
    
    numbers.forEach((number, index) => {
      const btn = document.createElement('button');
      btn.className = 'number-btn';
      btn.textContent = number;
      btn.dataset.value = number;
      btn.dataset.index = index;
      btn.onclick = () => placeNumber(number, btn);
      pool.appendChild(btn);
    });
  }
  
  // Boşluk seçimi
  function selectBlank(blank) {
    // Önceki seçimi temizle
    document.querySelectorAll('.blank').forEach(b => b.classList.remove('selected'));
    
    gameState.selectedBlank = blank;
    blank.classList.add('selected');
  }
  
  // Sayı yerleştir
  function placeNumber(number, btn) {
    if (gameState.selectedBlank && !gameState.selectedBlank.textContent) {
      gameState.selectedBlank.textContent = number;
      gameState.selectedBlank.classList.add('filled');
      gameState.selectedBlank.classList.remove('selected');
      btn.classList.add('used');
      btn.disabled = true;
      
      playSound('place');
      gameState.selectedBlank = null;
    } else {
      // Otomatik yerleştirme
      const emptyBlank = document.querySelector('.blank:not(.filled)');
      if (emptyBlank) {
        emptyBlank.textContent = number;
        emptyBlank.classList.add('filled');
        btn.classList.add('used');
        btn.disabled = true;
        playSound('place');
      }
    }
  }
  
  // Cevap kontrolü
  function checkAnswer() {
    if (!isAllBlanksFilled()) {
      showNotification("Lütfen tüm boşlukları doldur!", 'warning');
      return;
    }
    
    const userExpression = buildUserExpression();
    const userResult = calculateResult(userExpression);
    
    if (userResult === gameState.currentEquation.result) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  }
  
  function checkChallengeAnswer() {
    if (!isAllChallengeBlanksFilled()) {
      showNotification("Lütfen tüm boşlukları doldur!", 'warning');
      return;
    }
    
    const userExpression = buildChallengeUserExpression();
    const userResult = calculateResult(userExpression);
    
    if (userResult === gameState.currentEquation.result) {
      handleChallengCorrectAnswer();
    } else {
      handleChallengeWrongAnswer();
    }
  }
  
  function isAllBlanksFilled() {
    const blanks = document.querySelectorAll('#equation .blank');
    return Array.from(blanks).every(blank => blank.textContent.trim() !== '');
  }
  
  function isAllChallengeBlanksFilled() {
    const blanks = document.querySelectorAll('#challenge-equation .blank');
    return Array.from(blanks).every(blank => blank.textContent.trim() !== '');
  }
  
  function buildUserExpression() {
    const blanks = document.querySelectorAll('#equation .blank');
    const operators = document.querySelectorAll('#equation .operator');
    
    let expression = '';
    const parts = [];
    
    document.getElementById('equation').childNodes.forEach(node => {
      if (node.classList && node.classList.contains('blank')) {
        parts.push(node.textContent);
      } else if (node.classList && node.classList.contains('operator') && !node.textContent.includes('=')) {
        parts.push(node.textContent.trim());
      }
    });
    
    return parts.join('');
  }
  
  function buildChallengeUserExpression() {
    const parts = [];
    
    document.getElementById('challenge-equation').childNodes.forEach(node => {
      if (node.classList && node.classList.contains('blank')) {
        parts.push(node.textContent);
      } else if (node.classList && node.classList.contains('operator') && !node.textContent.includes('=')) {
        parts.push(node.textContent.trim());
      }
    });
    
    return parts.join('');
  }
  
  // Doğru cevap işleme
  function handleCorrectAnswer() {
    const timeTaken = (Date.now() - gameState.levelStartTime) / 1000;
    
    // Puan hesaplama
    let baseScore = gameState.currentLevel * 10;
    let timeBonus = Math.max(0, 20 - timeTaken) * 2;
    let comboBonus = gameState.currentCombo * 5;
    
    gameState.currentCombo++;
    gameState.maxCombo = Math.max(gameState.maxCombo, gameState.currentCombo);
    
    let totalScore = Math.floor(baseScore + timeBonus + comboBonus);
    gameState.currentScore += totalScore;
    
    playSound('correct');
    showNotification(`Doğru! +${totalScore} puan`, 'success');
    
    // Başarımları kontrol et
    checkAchievements(timeTaken);
    
    // Animasyon
    document.getElementById('equation-area').classList.add('correct-answer');
    setTimeout(() => {
      document.getElementById('equation-area').classList.remove('correct-answer');
    }, 600);
    
    if (gameState.currentLevel < gameState.maxLevel) {
      setTimeout(() => {
        gameState.currentLevel++;
        startLevel();
      }, 1500);
    } else {
      setTimeout(() => {
        endGame(true);
      }, 1500);
    }
  }
  
  function handleChallengCorrectAnswer() {
    gameState.problemsSolved++;
    gameState.challengeScore += 10 + Math.floor(gameState.problemsSolved / 5);
    gameState.challengeTimer += 3; // Bonus zaman
    
    playSound('correct');
    showNotification(`Doğru! +${10 + Math.floor(gameState.problemsSolved / 5)} puan`, 'success');
    
    // Yeni soru
    gameState.currentEquation = generateEquation(Math.min(5, Math.floor(gameState.problemsSolved / 3) + 1));
    renderEquation(gameState.currentEquation, 'challenge-equation');
    renderNumbers(gameState.currentEquation.numbers, 'challenge-numbers-pool');
    
    updateChallengeDisplay();
  }
  
  // Yanlış cevap işleme
  function handleWrongAnswer() {
    gameState.currentCombo = 0;
    
    playSound('wrong');
    showNotification("Yanlış cevap! Tekrar dene.", 'error');
    
    document.getElementById('equation-area').classList.add('wrong-answer');
    setTimeout(() => {
      document.getElementById('equation-area').classList.remove('wrong-answer');
    }, 600);
    
    // Boşlukları temizle
    setTimeout(() => {
      clearBlanks();
    }, 1000);
  }
  
  function handleChallengeWrongAnswer() {
    gameState.challengeTimer = Math.max(0, gameState.challengeTimer - 5); // Zaman cezası
    
    playSound('wrong');
    showNotification("Yanlış! -5 saniye", 'error');
    
    document.getElementById('challenge-equation-area').classList.add('wrong-answer');
    setTimeout(() => {
      document.getElementById('challenge-equation-area').classList.remove('wrong-answer');
      clearChallengeBlanks();
    }, 600);
  }
  
  // Boşlukları temizle
  function clearBlanks() {
    document.querySelectorAll('#equation .blank').forEach(blank => {
      blank.textContent = '';
      blank.classList.remove('filled', 'selected');
    });
    
    document.querySelectorAll('#numbers-pool .number-btn').forEach(btn => {
      btn.classList.remove('used');
      btn.disabled = false;
    });
    
    gameState.selectedBlank = null;
  }
  
  function clearChallengeBlanks() {
    document.querySelectorAll('#challenge-equation .blank').forEach(blank => {
      blank.textContent = '';
      blank.classList.remove('filled', 'selected');
    });
    
    document.querySelectorAll('#challenge-numbers-pool .number-btn').forEach(btn => {
      btn.classList.remove('used');
      btn.disabled = false;
    });
  }
  
  // İpucu sistemi
  function useHint() {
    if (gameState.hintsLeft <= 0) {
      showNotification("İpucu hakkınız kalmadı!", 'warning');
      return;
    }
    
    const emptyBlanks = document.querySelectorAll('#equation .blank:not(.filled)');
    if (emptyBlanks.length === 0) {
      showNotification("Tüm boşluklar dolu!", 'warning');
      return;
    }
    
    // Rastgele bir boşluğu doldur
    const randomBlank = emptyBlanks[Math.floor(Math.random() * emptyBlanks.length)];
    const expectedValue = randomBlank.dataset.expectedValue;
    
    // Doğru sayıyı bul ve yerleştir
    const numberBtn = document.querySelector(`#numbers-pool .number-btn[data-value="${expectedValue}"]:not(.used)`);
    if (numberBtn) {
      randomBlank.textContent = expectedValue;
      randomBlank.classList.add('filled');
      numberBtn.classList.add('used');
      numberBtn.disabled = true;
      
      gameState.hintsLeft--;
      document.getElementById('hint-count').textContent = gameState.hintsLeft;
      
      playSound('hint');
      showNotification("İpucu kullanıldı!", 'success');
    }
  }
  
  // Seviye atlama
  function skipLevel() {
    if (gameState.skipsLeft <= 0) {
      showNotification("Atlama hakkınız kalmadı!", 'warning');
      return;
    }
    
    gameState.skipsLeft--;
    document.getElementById('skip-count').textContent = gameState.skipsLeft;
    
    if (gameState.currentLevel < gameState.maxLevel) {
      gameState.currentLevel++;
      startLevel();
      playSound('skip');
      showNotification("Seviye atlandı!", 'success');
    }
  }
  
  // Güncelleme fonksiyonları
  function updateComboDisplay() {
    const comboEl = document.getElementById('combo-display');
    const comboCount = document.getElementById('combo-count');
    
    if (gameState.currentCombo > 1) {
      comboEl.classList.remove('hidden');
      comboCount.textContent = gameState.currentCombo;
      comboCount.classList.add('combo-multiplier');
    } else {
      comboEl.classList.add('hidden');
    }
  }
  
  function updateProgressBar() {
    const progress = (gameState.currentLevel / gameState.maxLevel) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
  }
  
  function updateChallengeDisplay() {
    document.getElementById('challenge-score').textContent = gameState.challengeScore;
    document.getElementById('problems-solved').textContent = gameState.problemsSolved;
  }
  
  function updateChallengeTimer() {
    const timerFill = document.getElementById('challenge-timer-fill');
    const timerText = document.getElementById('challenge-timer-text');
    
    const percentage = (gameState.challengeTimer / 60) * 100;
    timerFill.style.width = `${Math.max(0, percentage)}%`;
    timerText.textContent = `${Math.max(0, Math.ceil(gameState.challengeTimer))}s`;
    
    // Renk değişimi
    if (percentage < 20) {
      timerFill.style.background = 'linear-gradient(45deg, #d63031, #e17055)';
    } else if (percentage < 50) {
      timerFill.style.background = 'linear-gradient(45deg, #fdcb6e, #ffd93d)';
    }
  }
  
  function updateMenuStats() {
    document.getElementById('highest-level').textContent = playerStats.highestLevel;
    document.getElementById('total-score').textContent = playerStats.totalScore;
  }
  
  // Oyun sonu
  function endGame(completed) {
    gameState.isGameActive = false;
    
    // İstatistikleri güncelle
    playerStats.highestLevel = Math.max(playerStats.highestLevel, gameState.currentLevel);
    playerStats.totalScore += gameState.currentScore;
    playerStats.gamesPlayed++;
    
    // Sonuç ekranını göster
    document.getElementById('final-score').textContent = gameState.currentScore;
    document.getElementById('reached-level').textContent = gameState.currentLevel;
    document.getElementById('max-combo').textContent = gameState.maxCombo;
    
    if (completed) {
      document.getElementById('results-title').textContent = '🎉 Tebrikler! Oyunu Bitirdiniz!';
    } else {
      document.getElementById('results-title').textContent = '🎮 Oyun Bitti!';
    }
    
    // Yeni rekor kontrolü
    if (gameState.currentScore > 0) {
      document.getElementById('new-record').classList.remove('hidden');
    }
    
    switchScreen('results');
    playSound('gameEnd');
  }
  
  function endChallengeMode() {
    gameState.isGameActive = false;
    
    // İstatistikleri güncelle
    playerStats.totalScore += gameState.challengeScore;
    playerStats.gamesPlayed++;
    
    // Sonuç ekranını göster
    document.getElementById('final-score').textContent = gameState.challengeScore;
    document.getElementById('reached-level').textContent = gameState.problemsSolved;
    document.getElementById('max-combo').textContent = gameState.problemsSolved;
    
    document.getElementById('results-title').textContent = '⚡ Zaman Yarışı Bitti!';
    
    switchScreen('results');
    playSound('gameEnd');
  }
  
  // Başarımlar
  function checkAchievements(timeTaken) {
    const newAchievements = [];
    
    if (gameState.currentLevel === 1 && !playerStats.achievements.includes('firstWin')) {
      newAchievements.push('firstWin');
    }
    
    if (timeTaken < 5 && !playerStats.achievements.includes('speedster')) {
      newAchievements.push('speedster');
    }
    
    if (gameState.currentCombo >= 5 && !playerStats.achievements.includes('comboMaster')) {
      newAchievements.push('comboMaster');
    }
    
    if (gameState.currentLevel >= 10 && !playerStats.achievements.includes('mathWizard')) {
      newAchievements.push('mathWizard');
    }
    
    newAchievements.forEach(achievement => {
      if (!playerStats.achievements.includes(achievement)) {
        playerStats.achievements.push(achievement);
        showAchievement(achievements[achievement]);
      }
    });
  }
  
  function showAchievement(achievement) {
    showNotification(`${achievement.icon} ${achievement.name} kazandınız!`, 'success');
  }
  
  // Ayarlar
  function updateSetting(setting, value) {
    // Ayarları bellekte sakla
    switch(setting) {
      case 'difficulty':
        gameState.difficulty = value;
        break;
    }
  }
  
  function resetProgress() {
    if (confirm('Tüm ilerleme silinecek. Emin misiniz?')) {
      playerStats.highestLevel = 1;
      playerStats.totalScore = 0;
      playerStats.gamesPlayed = 0;
      playerStats.achievements = [];
      updateMenuStats();
      showNotification('İlerleme sıfırlandı!', 'success');
    }
  }
  
  // Ses efektleri
  function playSound(type) {
    // Ses efektleri buraya eklenebilir
    const soundEnabled = document.getElementById('sound-toggle').checked;
    if (!soundEnabled) return;
    
    // Titreşim
    const vibrationEnabled = document.getElementById('vibration-toggle').checked;
    if (vibrationEnabled && navigator.vibrate) {
      switch(type) {
        case 'correct':
          navigator.vibrate(100);
          break;
        case 'wrong':
          navigator.vibrate([100, 50, 100]);
          break;
        default:
          navigator.vibrate(50);
      }
    }
  }
  
  // Bildirim sistemi
  function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
  
  // Yardımcı fonksiyonlar
  function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Sayfa yüklendiğinde
  document.addEventListener('DOMContentLoaded', () => {
    updateMenuStats();
    
    // Klavye desteği
    document.addEventListener('keydown', (e) => {
      if (!gameState.isGameActive) return;
      
      if (e.key >= '1' && e.key <= '9') {
        const number = parseInt(e.key);
        const availableBtn = document.querySelector(`.number-btn[data-value="${number}"]:not(.used)`);
        if (availableBtn) {
          availableBtn.click();
        }
      }
      
      if (e.key === 'Enter') {
        if (gameState.gameMode === 'challenge') {
          checkChallengeAnswer();
        } else {
          checkAnswer();
        }
      }
      
      if (e.key === 'Escape') {
        clearBlanks();
      }
    });
  });
