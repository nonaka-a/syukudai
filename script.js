document.addEventListener('DOMContentLoaded', () => {
    // --- グローバル変数 ---
    let totalDamageToDeal = 0;
    let currentConfirmPageIndex = 0;
    const CONFIRM_PAGE_TITLES = ['これまでのがんばり', 'モンスターずかん', 'いまのバトル', 'せってい', 'あそびかた'];
    let resetQuizAnswer = 0;
    let BATTLE_ORDER = [];
    let isSwitchingPlayer = false; // ★追加：プレイヤー切り替え中のロックフラグ
    
    // セーブデータ管理用の変数
    let currentSaveSlot = 1;
    const SAVE_DATA_KEY_PREFIX = 'shukudaiQuestData_'; 
    const LAST_SLOT_KEY = 'shukudaiQuestLastSlot';

    const MONSTERS = MONSTERS_DATA;

    const sounds = {
        bgmBattle: new Audio('sounds/bgm_battle.mp3'),
        attack: new Audio('sounds/se_attack.mp3'),
        damage: new Audio('sounds/se_damage.mp3'),
        defeat: new Audio('sounds/se_defeat.mp3'),
        fanfare: new Audio('sounds/se_fanfare.mp3'),
        charge: new Audio('sounds/se_charge.mp3')
    };
    sounds.bgmBattle.loop = true;
    sounds.bgmBattle.volume = 0.5;

    // gameStateの初期値を関数で生成
    const createDefaultGameState = () => ({
        player: { name: 'キミ' },
        currentBattleIndex: 0,
        monstersStatus: MONSTERS.map(m => ({ id: m.id, currentHp: m.maxHp })),
        unlockedMonsters: [],
        homeworkHistory: [],
    });
    const gameState = {
        ...createDefaultGameState(),
        timer: { targetTotalSeconds: 0, remainingSeconds: 0, animationFrameId: null, lastUpdateTime: 0, homeworkStartTime: null, currentTimeInterval: null }
    };

    // --- 画面要素の取得 ---
    const ui = {
        fullscreenButton: document.getElementById('fullscreen-button'),
        titlePlayerName: document.getElementById('title-player-name'), 
        gameContainer: document.getElementById('game-container'),
        timerDisplay: document.getElementById('timer-display'),
        timePowerMessage: document.querySelector('#time-power-message span'),
        bonusPowerMessage: document.querySelector('#bonus-power-message span'),
        bonusCalcMessage: document.getElementById('bonus-calc-message'),
        totalDamageMessage: document.querySelector('#total-damage-message span'),
        monsterName: document.getElementById('monster-name'),
        playerName: document.getElementById('player-name'),
        playerSprite: document.getElementById('player-sprite'),
        monsterHpValue: document.getElementById('monster-hp-value'),
        monsterHpBar: document.getElementById('monster-hp-bar'),
        monsterHpText: document.getElementById('monster-hp-text'),
        messageText: document.getElementById('message-text'),
        monsterSprite: document.getElementById('monster-sprite'),
        historyList: document.getElementById('history-list'),
        zukanGrid: document.getElementById('zukan-grid'),
        currentTime: document.getElementById('current-time'),
        statusMonsterName: document.getElementById('status-monster-name'),
        statusMonsterHpValue: document.getElementById('status-monster-hp-value'),
        statusMonsterHpText: document.getElementById('status-monster-hp-text'),
        statusMonsterSprite: document.getElementById('status-monster-sprite'),
        nameInput: document.getElementById('name-input'),
        confirmPageTitle: document.getElementById('confirm-page-title'),
        resetConfirmationArea: document.getElementById('reset-confirmation-area'),
        statusCheckDisplay: document.getElementById('status-check-display'),
        noCurrentBattleMessage: document.getElementById('no-current-battle-message'),
        zukanDetailModal: document.getElementById('zukan-detail-modal'),
        zukanModalContent: document.querySelector('#zukan-detail-modal .modal-content'),
        zukanDetailName: document.getElementById('zukan-detail-name'),
        zukanDetailSprite: document.getElementById('zukan-detail-sprite'),
        zukanDetailId: document.getElementById('zukan-detail-id'),
        zukanDetailHp: document.getElementById('zukan-detail-hp'),
        zukanDetailDescription: document.getElementById('zukan-detail-description'),
        slashEffect: document.getElementById('slash-effect'),
        particleContainer: document.getElementById('particle-container'),
        completeMessageContainer: document.getElementById('complete-message-container'),
        switchPlayer1Button: document.getElementById('switch-player-1-button'),
        switchPlayer2Button: document.getElementById('switch-player-2-button')
    };
    const screens = { title: document.getElementById('title-screen'), timerSetting: document.getElementById('timer-setting-screen'), result: document.getElementById('result-screen'), battle: document.getElementById('battle-screen'), confirm: document.getElementById('confirm-screen') };
    const concentrationScreen = document.getElementById('concentration-screen');
    const confirmPages = [ document.getElementById('history-page'), document.getElementById('zukan-page'), document.getElementById('status-check-page'), document.getElementById('name-setting-page'), document.getElementById('how-to-play-page') ];
    const buttons = { startHomework: document.getElementById('start-homework-button'), confirm: document.getElementById('confirm-button'), startTimer: document.getElementById('start-timer-button'), stopTimer: document.getElementById('stop-timer-button'), cancelTimer: document.getElementById('cancel-timer-button'), backToTitle: document.getElementById('back-to-title-button'), nextBattle: document.getElementById('next-battle-button'), goToBattle: document.getElementById('go-to-battle-button'), confirmBack: document.getElementById('confirm-back-button'), prevPage: document.getElementById('prev-page-button'), nextPage: document.getElementById('next-page-button'), saveName: document.getElementById('save-name-button'), resetButton: document.getElementById('reset-button') };
    const pickers = { minutes: { element: document.querySelector('#minutes-picker .picker-list'), value: 10, max: 30 }, seconds: { element: document.querySelector('#seconds-picker .picker-list'), value: 0, max: 59 } };
    const ITEM_HEIGHT = 60;
    
    // --- 関数定義 ---
    const toggleFullScreen = () => {
        const docEl = document.documentElement;
        const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        const cancelFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;

        const isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

        if (!isFullScreen) {
            if (requestFullScreen) {
                requestFullScreen.call(docEl);
            }
        } else {
            if (cancelFullScreen) {
                cancelFullScreen.call(document);
            }
        }
    };

    const handleFullScreenChange = () => {
        const isFullScreen = !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        document.body.classList.toggle('fullscreen', isFullScreen);
    };
    const showDamagePopup = (damage, element) => {
        const popup = document.createElement('span');
        popup.textContent = damage;
        popup.className = 'damage-popup';
        
        const rect = element.getBoundingClientRect();
        const containerRect = ui.gameContainer.getBoundingClientRect();

        popup.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top - containerRect.top + rect.height / 4}px`;

        screens.battle.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1000);
    };

    const setSprite = (element, monsterId) => {
        const monster = MONSTERS.find(m => m.id === monsterId);
        if (!monster || !SPRITESHEET_ATLAS) return;

        const frameData = SPRITESHEET_ATLAS.frames[monster.image];
        if (!frameData) {
            element.style.backgroundImage = 'none';
            element.style.backgroundColor = '#cccccc';
            return;
        }

        const elemStyle = window.getComputedStyle(element);
        const displayWidth = parseInt(elemStyle.width, 10);
        const displayHeight = parseInt(elemStyle.height, 10);

        const spriteWidth = frameData.sourceSize.w;
        const spriteHeight = frameData.sourceSize.h;
        const sheetWidth = SPRITESHEET_ATLAS.meta.size.w;
        const sheetHeight = SPRITESHEET_ATLAS.meta.size.h;

        const scaleX = displayWidth / spriteWidth;
        const scaleY = displayHeight / spriteHeight;
        
        const scaledSheetWidth = sheetWidth * scaleX;
        const scaledSheetHeight = sheetHeight * scaleY;
        
        const posX = frameData.frame.x * scaleX;
        const posY = frameData.frame.y * scaleY;

        element.style.backgroundImage = `url('${SPRITESHEET_IMAGE_URL}')`;
        element.style.backgroundSize = `${scaledSheetWidth}px ${scaledSheetHeight}px`;
        element.style.backgroundPosition = `-${posX}px -${posY}px`;
        element.style.backgroundColor = 'transparent';
    };
    
    const switchScreen = (screenName) => {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
        if (screenName === 'title') {
            ui.titlePlayerName.textContent = `${gameState.player.name} の`;
        }
        if (screenName === 'timerSetting') {
            updateCurrentTime();
            gameState.timer.currentTimeInterval = setInterval(updateCurrentTime, 1000);
        } else {
            clearInterval(gameState.timer.currentTimeInterval);
        }
        if (screenName !== 'confirm') {
            ui.resetConfirmationArea.style.display = 'none';
        }
    };
    const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    const formatDate = (date) => `${date.getMonth()+1}月${date.getDate()}日`;
    const format12HourTime = (date) => {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'ごご' : 'ごぜん';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${ampm} ${hours}:${minutes}`;
    };
    const updateCurrentTime = () => { ui.currentTime.textContent = format12HourTime(new Date()); };
    
    const saveGameData = () => {
        try {
            const dataToSave = { 
                player: gameState.player, 
                currentBattleIndex: gameState.currentBattleIndex,
                monstersStatus: gameState.monstersStatus, 
                unlockedMonsters: gameState.unlockedMonsters, 
                homeworkHistory: gameState.homeworkHistory 
            };
            localStorage.setItem(`${SAVE_DATA_KEY_PREFIX}${currentSaveSlot}`, JSON.stringify(dataToSave));
        } catch (e) {
            console.error("セーブに失敗しました:", e);
        }
    };

    const loadGameData = () => {
        const savedData = localStorage.getItem(`${SAVE_DATA_KEY_PREFIX}${currentSaveSlot}`);
        const defaultData = createDefaultGameState();
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                gameState.player = parsedData.player || defaultData.player;
                gameState.currentBattleIndex = parsedData.currentBattleIndex || defaultData.currentBattleIndex;
                gameState.monstersStatus = parsedData.monstersStatus || defaultData.monstersStatus;
                gameState.unlockedMonsters = parsedData.unlockedMonsters || defaultData.unlockedMonsters;
                gameState.homeworkHistory = parsedData.homeworkHistory || defaultData.homeworkHistory;
            } catch (e) {
                console.error("セーブデータの読み込みに失敗しました:", e);
                Object.assign(gameState, defaultData);
            }
        } else {
            Object.assign(gameState, defaultData);
        }
    };

    const resetGameData = () => {
        localStorage.removeItem(`${SAVE_DATA_KEY_PREFIX}${currentSaveSlot}`);
        alert(`プレイヤー${currentSaveSlot}のデータをしょきかしました。`);
        location.reload();
    };

    // ★★★ 変更点：競合状態（Race Condition）を防ぐための修正 ★★★
    const switchPlayer = (slotNumber) => {
        // 処理中、または同じスロットが押された場合は何もしない
        if (isSwitchingPlayer || slotNumber === currentSaveSlot) return;

        // 処理が始まったらロックをかけ、ボタンを無効化する
        isSwitchingPlayer = true;
        ui.switchPlayer1Button.disabled = true;
        ui.switchPlayer2Button.disabled = true;
        
        // ユーザーに処理中であることを視覚的に伝える
        const buttonToUpdate = slotNumber === 1 ? ui.switchPlayer1Button : ui.switchPlayer2Button;
        buttonToUpdate.textContent = 'よみこみちゅう…';

        // 現在のデータを確実にセーブ
        saveGameData();
        
        // 新しいスロット番号を設定
        currentSaveSlot = slotNumber;
        localStorage.setItem(LAST_SLOT_KEY, currentSaveSlot);
        
        // 画面をリロードして、新しいデータをクリーンな状態で読み込む
        // 少しだけ待ってからリロードすると、ブラウザがボタンの表示を更新する余裕が生まれる
        setTimeout(() => {
            location.reload();
        }, 100);
    };

    const updatePlayerSwitchUI = () => {
        ui.switchPlayer1Button.classList.toggle('active-player', currentSaveSlot === 1);
        ui.switchPlayer2Button.classList.toggle('active-player', currentSaveSlot === 2);
    };

    const updateHpBar = (monster, isStatusCheck = false) => {
        const monsterStatus = gameState.monstersStatus.find(s => s.id === monster.id);
        if (!monsterStatus) return; // 安全対策
        const hpPercentage = (monsterStatus.currentHp / monster.maxHp) * 100;
        const hpText = `${monsterStatus.currentHp} / ${monster.maxHp}`;
        
        if (isStatusCheck) {
            ui.statusMonsterHpValue.style.width = `${hpPercentage}%`;
            ui.statusMonsterHpText.textContent = hpText;
        } else {
            ui.monsterHpValue.style.width = `${hpPercentage}%`;
            ui.monsterHpText.textContent = hpText;
        }
    };

    const showMessage = (text) => new Promise(resolve => {
        ui.messageText.textContent = text;
        setTimeout(resolve, 2200);
    });

    const createDefeatParticles = (monsterRect) => {
        return new Promise(resolve => {
            const containerRect = ui.particleContainer.getBoundingClientRect();
            
            const startX = monsterRect.left - containerRect.left + monsterRect.width / 2;
            const startY = monsterRect.top - containerRect.top + monsterRect.height / 2;
            const PARTICLE_COUNT = 30;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = `${startX}px`;
                p.style.top = `${startY}px`;
                ui.particleContainer.appendChild(p);

                const angle = Math.random() * 360;
                const radius = Math.random() * 150 + 50;
                const x = Math.cos(angle * Math.PI / 180) * radius;
                const y = Math.sin(angle * Math.PI / 180) * radius;
                
                requestAnimationFrame(() => {
                    p.style.transform = `translate(${x}px, ${y}px)`;
                    p.style.opacity = 0;
                });
                
                setTimeout(() => p.remove(), 1000);
            }
            setTimeout(resolve, 1000);
        });
    };

    const runBattleSequence = async (damage) => {
        const currentMonsterId = BATTLE_ORDER[gameState.currentBattleIndex];
        const monster = MONSTERS.find(m => m.id === currentMonsterId);
        const monsterStatus = gameState.monstersStatus.find(s => s.id === currentMonsterId);

        ui.monsterSprite.style.transition = 'opacity 0.5s';

        await showMessage(`${gameState.player.name}は ちからをためている！`);
        ui.playerSprite.classList.add('charging');
        sounds.charge.currentTime = 0;
        sounds.charge.play();
        await new Promise(resolve => setTimeout(resolve, 2200)); 
        ui.playerSprite.classList.remove('charging');

        await showMessage(`${gameState.player.name}の こうげき！`);

        if (damage > 0) {
            sounds.attack.currentTime = 0;
            sounds.attack.play();
            ui.slashEffect.classList.add('active');
            ui.gameContainer.classList.add('shake');
            ui.monsterSprite.classList.add('flash');
            showDamagePopup(damage, ui.monsterSprite);
            setTimeout(() => {
                ui.slashEffect.classList.remove('active');
                ui.gameContainer.classList.remove('shake');
                ui.monsterSprite.classList.remove('flash');
            }, 500);
            await new Promise(resolve => setTimeout(resolve, 200));
            sounds.damage.currentTime = 0;
            sounds.damage.play();
            monsterStatus.currentHp -= damage;
            if (monsterStatus.currentHp < 0) monsterStatus.currentHp = 0;
            updateHpBar(monster);
            await showMessage(`${monster.name}に ${damage} のダメージ！`);
        } else {
            await showMessage('しかし こうげきははずれた！');
        }

        if (monsterStatus.currentHp <= 0) {
            const monsterRect = ui.monsterSprite.getBoundingClientRect();
            sounds.defeat.currentTime = 0;
            sounds.defeat.play();
            ui.monsterSprite.style.opacity = '0'; 
            await createDefeatParticles(monsterRect);
            await showMessage(`${monster.name}を たおした！`);
            sounds.fanfare.currentTime = 0;
            sounds.fanfare.play();
            
            if (!gameState.unlockedMonsters.includes(currentMonsterId)) {
                gameState.unlockedMonsters.push(currentMonsterId);
            }

            if (gameState.currentBattleIndex >= BATTLE_ORDER.length - 1) {
                ui.completeMessageContainer.classList.add('show');
                ui.messageText.textContent = 'すべてのモンスターをたおした！';
            } else {
                ui.messageText.textContent = 'やったね！しゅくだいクリア！';
                gameState.currentBattleIndex++;
            }
        } else {
            await showMessage(`${monster.name}ののこりHPは ${monsterStatus.currentHp}だ。`);
            ui.messageText.textContent = 'おしい！つぎのしゅくだいでたおそう！';
        }

        buttons.nextBattle.style.display = 'block';
        saveGameData();
    };

    const startBattle = (damage) => {
        const currentMonsterId = BATTLE_ORDER[gameState.currentBattleIndex];
        const monster = MONSTERS.find(m => m.id === currentMonsterId);

        ui.messageText.textContent = ''; 
        ui.completeMessageContainer.classList.remove('show'); 

        // 背景設定はプリロード済みなので直接設定
        if (monster && monster.background) {
            screens.battle.style.backgroundImage = `url('BG/${monster.background}')`;
        } else {
            screens.battle.style.backgroundImage = `url('bg_battle.png')`;
        }

        ui.monsterName.textContent = monster.name;
        ui.playerName.textContent = gameState.player.name;
        setSprite(ui.monsterSprite, currentMonsterId);

        ui.monsterSprite.style.transform = '';
        ui.monsterSprite.style.opacity = '';
        ui.playerSprite.style.transform = '';
        ui.playerSprite.style.opacity = '';
        
        ui.monsterSprite.style.opacity = '1';

        updateHpBar(monster);
        buttons.nextBattle.style.display = 'none';
        
        ui.monsterSprite.classList.add('slide-in-left');
        ui.playerSprite.classList.add('slide-in-right');

        sounds.bgmBattle.currentTime = 0;
        sounds.bgmBattle.play().catch(e => console.error("BGMの再生に失敗しました:", e));

        switchScreen('battle');
        
        setTimeout(() => {
            ui.monsterSprite.classList.remove('slide-in-left');
            ui.playerSprite.classList.remove('slide-in-right');
            
            ui.monsterSprite.style.transform = 'translateX(0)';
            ui.playerSprite.style.transform = 'translateX(0)';
            ui.monsterSprite.style.opacity = '1';
            ui.playerSprite.style.opacity = '1';

            runBattleSequence(damage);
        }, 1200);
    };

    const timerLoop = (timestamp) => {
        if (!gameState.timer.lastUpdateTime) gameState.timer.lastUpdateTime = timestamp;
        const elapsed = timestamp - gameState.timer.lastUpdateTime;
        if (elapsed >= 1000) {
            gameState.timer.remainingSeconds--;
            ui.timerDisplay.textContent = formatTime(gameState.timer.remainingSeconds);
            gameState.timer.lastUpdateTime = timestamp;
            if (gameState.timer.remainingSeconds <= 0) {
                finishConcentrationPhase(true);
                return;
            }
        }
        gameState.timer.animationFrameId = requestAnimationFrame(timerLoop);
    };

    const cancelConcentrationPhase = () => {
        if (gameState.timer.animationFrameId) {
            cancelAnimationFrame(gameState.timer.animationFrameId);
            gameState.timer.animationFrameId = null;
        }
        concentrationScreen.style.display = 'none';
        switchScreen('timerSetting');
    };

    const finishConcentrationPhase = (isTimeUp = false) => {
        if (gameState.timer.animationFrameId) { cancelAnimationFrame(gameState.timer.animationFrameId); gameState.timer.animationFrameId = null; }
        concentrationScreen.style.display = 'none';
        const timePower = isTimeUp ? 0 : gameState.timer.remainingSeconds;
        const BONUS_BASE_HOUR_24 = 22;
        const startHour24 = gameState.timer.homeworkStartTime.getHours();
        let bonusPower = 0;
        let bonusCalcText = 'はやくはじめたボーナスはなし';
        if (startHour24 < BONUS_BASE_HOUR_24) {
            bonusPower = (BONUS_BASE_HOUR_24 - startHour24) * 10;
            const baseDisplayHour = BONUS_BASE_HOUR_24 > 12 ? BONUS_BASE_HOUR_24 - 12 : BONUS_BASE_HOUR_24;
            let startDisplayHour = startHour24 > 12 ? startHour24 - 12 : startHour24;
            startDisplayHour = startDisplayHour === 0 ? 12 : startDisplayHour;
            bonusCalcText = `(${baseDisplayHour} - ${startDisplayHour}じ) × 10 = ${bonusPower}ダメージついか！`;
        }
        totalDamageToDeal = timePower + bonusPower;
        ui.timePowerMessage.textContent = timePower;
        ui.bonusPowerMessage.textContent = bonusPower;
        ui.bonusCalcMessage.textContent = bonusCalcText;
        ui.totalDamageMessage.textContent = totalDamageToDeal;
        const historyEntry = { 
            date: formatDate(new Date()), 
            startTime: format12HourTime(gameState.timer.homeworkStartTime), 
            targetTime: formatTime(gameState.timer.targetTotalSeconds), 
            actualTime: formatTime(gameState.timer.targetTotalSeconds - timePower), 
            result: `${totalDamageToDeal}パワー` 
        };
        gameState.homeworkHistory.unshift(historyEntry);
        if (gameState.homeworkHistory.length > 50) gameState.homeworkHistory.pop();
        saveGameData();
        switchScreen('result');
    };
    
    const renderHistory = () => {
        ui.historyList.innerHTML = `<div class="history-item history-header"><span>日付</span><span>はじめた時間</span><span>もくひょう</span><span>かかった時間</span><span>けっか</span></div>`;
        if (gameState.homeworkHistory.length === 0) {
            ui.historyList.innerHTML += '<p>まだ がんばったきろくがないよ。</p>';
            return;
        }
        gameState.homeworkHistory.forEach(h => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `<span>${h.date}</span><span>${h.startTime}</span><span>${h.targetTime}</span><span>${h.actualTime}</span><span>${h.result}</span>`;
            ui.historyList.appendChild(item);
        });
    };
    
    const showZukanDetail = (monsterId) => {
        const monster = MONSTERS.find(m => m.id === monsterId);
        if (!monster) return;

        ui.zukanDetailName.textContent = monster.name;
        setSprite(ui.zukanDetailSprite, monsterId);
        ui.zukanDetailId.textContent = `No.${String(monster.id).padStart(2, '0')}`;
        ui.zukanDetailHp.textContent = `HP: ${monster.maxHp}`;
        ui.zukanDetailDescription.innerText = monster.description;

        ui.zukanDetailModal.style.display = 'flex';
    };

    const renderZukan = () => {
        ui.zukanGrid.innerHTML = '';
        MONSTERS.forEach(monster => {
            const card = document.createElement('div');
            card.className = 'zukan-card';
            const isUnlocked = gameState.unlockedMonsters.includes(monster.id);
            
            const spriteDiv = document.createElement('div');
            spriteDiv.className = 'zukan-sprite';

            const frameData = SPRITESHEET_ATLAS.frames[monster.image];
            if (frameData) {
                const displayWidth = 80;
                const displayHeight = 80;

                const scaleX = displayWidth / frameData.sourceSize.w;
                const scaleY = displayHeight / frameData.sourceSize.h;
                
                const scaledSheetWidth = SPRITESHEET_ATLAS.meta.size.w * scaleX;
                const scaledSheetHeight = SPRITESHEET_ATLAS.meta.size.h * scaleY;
                
                const posX = frameData.frame.x * scaleX;
                const posY = frameData.frame.y * scaleY;

                spriteDiv.style.backgroundImage = `url('${SPRITESHEET_IMAGE_URL}')`;
                spriteDiv.style.backgroundSize = `${scaledSheetWidth}px ${scaledSheetHeight}px`;
                spriteDiv.style.backgroundPosition = `-${posX}px -${posY}px`;
            }
            
            if (isUnlocked) {
                card.innerHTML = `<div class="zukan-name">${monster.name}</div>`;
                card.prepend(spriteDiv);
                card.classList.add('unlocked');
                card.addEventListener('click', () => showZukanDetail(monster.id));
            } else {
                card.classList.add('locked');
                spriteDiv.classList.add('locked');
                card.innerHTML = `<div class="zukan-name">？？？？</div>`;
                card.prepend(spriteDiv);
            }
            ui.zukanGrid.appendChild(card);
        });
    };
    
    const renderStatusCheck = () => {
        if (gameState.currentBattleIndex >= BATTLE_ORDER.length) {
            ui.statusCheckDisplay.style.display = 'none';
            ui.noCurrentBattleMessage.style.display = 'block';
            return;
        }

        const currentMonsterId = BATTLE_ORDER[gameState.currentBattleIndex];
        const monster = MONSTERS.find(m => m.id === currentMonsterId);
        if (!monster) return;

        const monsterStatus = gameState.monstersStatus.find(s => s.id === currentMonsterId);

        if (monsterStatus && monsterStatus.currentHp > 0) {
            ui.statusCheckDisplay.style.display = 'flex';
            ui.noCurrentBattleMessage.style.display = 'none';

            ui.statusMonsterName.textContent = monster.name;
            setSprite(ui.statusMonsterSprite, currentMonsterId);
            updateHpBar(monster, true);
        } else {
            ui.statusCheckDisplay.style.display = 'none';
            ui.noCurrentBattleMessage.style.display = 'block';
        }
    };

    const showConfirmPage = (index) => {
        currentConfirmPageIndex = index;
        ui.confirmPageTitle.textContent = CONFIRM_PAGE_TITLES[index];
        confirmPages.forEach((page, i) => { page.classList.toggle('active', i === index); });
        if (index === 0) renderHistory();
        if (index === 1) renderZukan();
        if (index === 2) renderStatusCheck();
        if (index === 3) {
            ui.nameInput.value = gameState.player.name;
            updatePlayerSwitchUI();
        }
    };

    const preloadImages = (imageUrls) => {
        const promises = imageUrls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve();
                img.onerror = () => {
                    console.warn(`画像の読み込みに失敗しました: ${url}`);
                    resolve();
                };
            });
        });
        return Promise.all(promises);
    };
    
    const initializeApp = () => {
        const lastSlot = localStorage.getItem(LAST_SLOT_KEY);
        if (lastSlot) {
            currentSaveSlot = parseInt(lastSlot, 10);
        }
        
        // ★★★ 登場順ロジックは変更なし（HPのみでソート） ★★★
        BATTLE_ORDER = MONSTERS
            .map(monster => ({ id: monster.id, maxHp: monster.maxHp }))
            .sort((a, b) => a.maxHp - b.maxHp)
            .map(monster => monster.id);
        
        loadGameData();

        const _initializePicker = (picker, initialValue) => {
            picker.element.innerHTML = '';
            picker.element.appendChild(document.createElement('div'));
            for (let i = 0; i <= picker.max; i++) {
                const item = document.createElement('div');
                item.textContent = String(i).padStart(2, '0');
                picker.element.appendChild(item);
            }
            picker.element.appendChild(document.createElement('div'));
            picker.value = initialValue;
            picker.element.style.transform = `translateY(${-ITEM_HEIGHT * picker.value}px)`;
            _setupPickerEvents(picker);
        };
        const _setupPickerEvents = (picker) => {
            const pickerColumn = picker.element.parentElement;
            let isDragging = false, startY, startTranslateY;
            const handleDragStart = (clientY) => { isDragging = true; startY = clientY; startTranslateY = new DOMMatrix(window.getComputedStyle(picker.element).transform).m42; picker.element.style.transition = 'none'; };
            const handleDragMove = (clientY) => { if (!isDragging) return; picker.element.style.transform = `translateY(${startTranslateY + (clientY - startY)}px)`; };
            const handleDragEnd = () => { if (!isDragging) return; isDragging = false; picker.element.style.transition = 'transform 0.2s ease-out'; let targetIndex = Math.round(-(new DOMMatrix(window.getComputedStyle(picker.element).transform).m42) / ITEM_HEIGHT); targetIndex = Math.max(0, Math.min(targetIndex, picker.max)); picker.value = targetIndex; picker.element.style.transform = `translateY(${-ITEM_HEIGHT * picker.value}px)`; };
            pickerColumn.addEventListener('mousedown', (e) => handleDragStart(e.clientY));
            window.addEventListener('mousemove', (e) => handleDragMove(e.clientY));
            window.addEventListener('mouseup', handleDragEnd);
            pickerColumn.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].clientY), { passive: true });
            window.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientY));
            window.addEventListener('touchend', handleDragEnd);
        };
        _initializePicker(pickers.minutes, 10);
        _initializePicker(pickers.seconds, 0);

        ui.zukanDetailModal.addEventListener('click', () => { ui.zukanDetailModal.style.display = 'none'; });
        ui.zukanModalContent.addEventListener('click', (e) => e.stopPropagation());
        ui.completeMessageContainer.addEventListener('click', () => { ui.completeMessageContainer.classList.remove('show'); });
        
        const backgroundUrls = MONSTERS
            .filter(m => m.background)
            .map(m => `BG/${m.background}`);
        
        backgroundUrls.push('bg_title.png');
        backgroundUrls.push('bg_battle.png'); 

        console.log('背景画像をプリロード中...');
        preloadImages(Array.from(new Set(backgroundUrls))) 
            .then(() => {
                console.log('背景画像のプリロードが完了しました。');
                switchScreen('title');
            })
            .catch(error => {
                console.error('背景画像のプリロード中にエラーが発生しました:', error);
                switchScreen('title');
            });
    };
    
    // --- イベントリスナー設定 ---
    buttons.startHomework.addEventListener('click', () => switchScreen('timerSetting'));
    buttons.backToTitle.addEventListener('click', () => switchScreen('title'));
    buttons.nextBattle.addEventListener('click', () => {
        sounds.bgmBattle.pause();
        sounds.fanfare.pause();
        sounds.fanfare.currentTime = 0;
        switchScreen('title');
    });
    buttons.confirmBack.addEventListener('click', () => switchScreen('title'));
    buttons.goToBattle.addEventListener('click', () => {
        if (gameState.currentBattleIndex >= BATTLE_ORDER.length) {
            startBattle(totalDamageToDeal);
            return;
        }
        const currentMonsterId = BATTLE_ORDER[gameState.currentBattleIndex];
        const monster = MONSTERS.find(m => m.id === currentMonsterId);
        
        const bgUrl = (monster && monster.background) ? `BG/${monster.background}` : 'bg_battle.png';
        
        preloadImages([bgUrl]).then(() => {
            startBattle(totalDamageToDeal);
        }).catch(error => {
            console.error('バトル背景のプリロードに失敗しました:', error);
            startBattle(totalDamageToDeal);
        });
    });

    buttons.confirm.addEventListener('click', () => {
        switchScreen('confirm');
        showConfirmPage(0);
    });
    buttons.prevPage.addEventListener('click', () => {
        currentConfirmPageIndex = (currentConfirmPageIndex - 1 + confirmPages.length) % confirmPages.length;
        showConfirmPage(currentConfirmPageIndex);
    });
    buttons.nextPage.addEventListener('click', () => {
        currentConfirmPageIndex = (currentConfirmPageIndex + 1) % confirmPages.length;
        showConfirmPage(currentConfirmPageIndex);
    });
    buttons.saveName.addEventListener('click', () => {
        const newName = ui.nameInput.value.trim();
        if (newName && newName.length <= 8) {
            gameState.player.name = newName;
            saveGameData();
            alert('なまえをへんこうしたよ！');
            ui.titlePlayerName.textContent = `${gameState.player.name} の`;
        } else {
            alert('なまえは1～8もじでいれてね。');
        }
    });

    buttons.resetButton.addEventListener('click', () => {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        const num3 = Math.floor(Math.random() * 9) + 1;
        resetQuizAnswer = num1 + num2 * num3;

        const quizHTML = `
            <p>データをしょきかするには、したのもんだいを といてください。</p>
            <p><strong>もんだい: ${num1} + ${num2} × ${num3} = ?</strong></p>
            <input type="number" id="reset-answer-input" class="rpg-input">
            <button id="submit-reset-answer-button" class="btn">こたえあわせ</button>
            <button id="cancel-reset-button" class="btn btn-secondary">やめる</button>
        `;
        ui.resetConfirmationArea.innerHTML = quizHTML;
        ui.resetConfirmationArea.style.display = 'block';

        document.getElementById('submit-reset-answer-button').addEventListener('click', () => {
            const answerInput = document.getElementById('reset-answer-input');
            const userAnswer = parseInt(answerInput.value, 10);
            if (userAnswer === resetQuizAnswer) {
                const finalConfirmHTML = `
                    <p>ほんとうに しょきかしますか？<br>（すべてのデータがきえます）</p>
                    <button id="confirm-reset-button" class="btn btn-danger">はい</button>
                    <button id="cancel-final-reset-button" class="btn btn-secondary">もどる</button>
                `;
                ui.resetConfirmationArea.innerHTML = finalConfirmHTML;

                document.getElementById('confirm-reset-button').addEventListener('click', resetGameData);
                document.getElementById('cancel-final-reset-button').addEventListener('click', () => {
                    ui.resetConfirmationArea.style.display = 'none';
                });
            } else {
                alert('こたえが ちがうよ。');
                answerInput.value = '';
            }
        });

        document.getElementById('cancel-reset-button').addEventListener('click', () => {
            ui.resetConfirmationArea.style.display = 'none';
        });
    });

    buttons.startTimer.addEventListener('click', () => {
        gameState.timer.targetTotalSeconds = (pickers.minutes.value * 60) + pickers.seconds.value;
        if (gameState.timer.targetTotalSeconds > 0) {
            gameState.timer.homeworkStartTime = new Date();
            gameState.timer.remainingSeconds = gameState.timer.targetTotalSeconds;
            concentrationScreen.style.display = 'flex';
            ui.timerDisplay.textContent = formatTime(gameState.timer.remainingSeconds);
            gameState.timer.lastUpdateTime = 0;
            gameState.timer.animationFrameId = requestAnimationFrame(timerLoop);
        } else {
            alert('時間は1秒いじょうに設定してね。');
        }
    });
    buttons.stopTimer.addEventListener('click', () => finishConcentrationPhase(false));
    
    buttons.cancelTimer.addEventListener('click', cancelConcentrationPhase);

    ui.switchPlayer1Button.addEventListener('click', () => switchPlayer(1));
    ui.switchPlayer2Button.addEventListener('click', () => switchPlayer(2));
    
    ui.fullscreenButton.addEventListener('click', toggleFullScreen);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    // --- 初期化処理 ---
    initializeApp();
});