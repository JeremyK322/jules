// ── Debate Mode Controller & Second Brain Engine ────────────────────
(function(window) {
  let debateModeActive = false;
  let debateRunning = false;
  let debateStopRequested = false;
  let debateTurnCount = 0;
  let debateTargetLimit = 4;
  let secondBrainLog = [];
  let mainDebateLog = [];
  let lastInjectedDebateIndex = 0;

  function injectMainDebateToChatLog() {
    if (!window.chatLog || lastInjectedDebateIndex >= mainDebateLog.length) return;
    for (let i = lastInjectedDebateIndex; i < mainDebateLog.length; i++) {
      window.chatLog.push(mainDebateLog[i]);
    }
    lastInjectedDebateIndex = mainDebateLog.length;
    if (window.save) window.save('wc_chatLog', window.chatLog);
    if (window.autoSave) window.autoSave();
  }

  const MAIN_DEBATE_ROLE_SYS = "You are the Main Thread in a structured debate with Second Brain. You and Second Brain are on the SAME TEAM engaged in a constructive, peer-to-peer debate to stress-test, refine, and defend the user's ideas and architecture.\n\nIMPORTANT CONTEXT & RULES:\n1. You have full workspace and document context; Second Brain enters blind. You must explain key concepts and current architecture to Second Brain so it can critique intelligently.\n2. KEEP ALL EXCHANGES SHORT AND FOCUSED. Do not write lengthy essays. Remind Second Brain to keep its replies short as well.\n3. Your response will be passed directly to Second Brain. Start your response with 'Second Brain,'. Do not address the human user directly unless outputting %%%STOP.\n4. Memory and workspace tools (ADD, UPDATE, DELETE) are disabled during Debate Mode.\n5. In Debate Mode, you never end the debate yourself. Reply to Second Brain's last point. If you believe the debate has reached a natural conclusion, output [END_DEBATE] on a line by itself and stop.";

  const SECOND_BRAIN_SYS = "You are the Second Brain in a structured debate with the Main Thread. You and Main Thread are on the SAME TEAM engaged in a constructive debate to stress-test and sharpen the user's ideas.\n\nIMPORTANT RULES:\n1. You have no memory of past sessions or documents — Main Thread will provide the necessary context in its messages.\n2. KEEP ALL EXCHANGES SHORT, CRITICAL, AND CONCISE. Focus on key structural questions without unnecessary fluff.\n3. Your next response will be passed directly to Main Thread. Start your response with 'Main Thread,'. Do not address the human user unless outputting %%%STOP.\n4. Memory and workspace tools (ADD, UPDATE, DELETE) are disabled during Debate Mode.\n5. Do not produce closing summaries or end the debate unless outputting [END_DEBATE] when finished.";

  function toggleDebateMode(enable) {
    debateModeActive = enable !== undefined ? enable : !debateModeActive;
    window.debateModeActive = debateModeActive;
    const btn = document.getElementById('btnDebateToggle');
    const debateBar = document.getElementById('debateBar');
    const splitWrapper = document.getElementById('splitChatWrapper');
    const chatC = document.getElementById('chatContainer');

    if (debateModeActive) {
      if (btn) btn.classList.add('active');
      if (debateBar) debateBar.classList.add('active');
      if (splitWrapper) splitWrapper.classList.remove('hidden');
      if (chatC) chatC.classList.add('hidden');

      // Reset debate-specific chat windows on entry
      mainDebateLog = [];
      secondBrainLog = [];
      lastInjectedDebateIndex = 0;
      debateTurnCount = 0;
      updateDebateUI();
      syncSplitChatViews();
    } else {
      injectMainDebateToChatLog();
      if (btn) btn.classList.remove('active');
      if (debateBar) debateBar.classList.remove('active');
      if (splitWrapper) splitWrapper.classList.add('hidden');
      if (chatC) chatC.classList.remove('hidden');
      if (chatC) chatC.innerHTML = '';
      if (window.restoreChatHistory) window.restoreChatHistory();
    }
  }

  function syncSplitChatViews() {
    const chatCMain = document.getElementById('chatContainerMain');
    const chatCSecond = document.getElementById('chatContainerSecond');
    if (!chatCMain || !chatCSecond) return;

    chatCMain.innerHTML = '';
    chatCSecond.innerHTML = '';

    mainDebateLog.forEach(m => {
      let label = m.role === 'assistant' ? (window.APP || 'The Adze') : m.role === 'user' ? 'You' : 'System';
      if (m.role === 'user' && m.content.startsWith('[Second Brain]:')) label = 'Second Brain';
      appendBubbleColumn(chatCMain, m.role, m.content, label);
    });

    secondBrainLog.forEach(m => {
      let label = m.role === 'assistant' ? 'Second Brain' : m.role === 'user' ? 'User' : 'System';
      if (m.role === 'user' && m.content.startsWith('[Main Thread]:')) label = 'Main Thread';
      appendBubbleColumn(chatCSecond, m.role, m.content, label);
    });

    scrollSplitChats();
  }

  function scrollSplitChats() {
    requestAnimationFrame(() => {
      const chatCMain = document.getElementById('chatContainerMain');
      const chatCSecond = document.getElementById('chatContainerSecond');
      if (chatCMain) chatCMain.scrollTop = chatCMain.scrollHeight;
      if (chatCSecond) chatCSecond.scrollTop = chatCSecond.scrollHeight;
    });
  }

  function appendBubbleColumn(container, role, content, labelOverride, isErr) {
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-message ' + role;
    if (isErr) div.style.borderColor = 'rgba(209,155,155,0.5)';
    const label = labelOverride || (role === 'user' ? 'You' : (window.APP || 'The Adze'));
    div.innerHTML = `<div class="msg-label">${window.esc ? window.esc(label) : label}</div><div class="msg-content">${window.esc ? window.esc(content) : content}</div>`;
    container.appendChild(div);
    scrollSplitChats();
  }

  function showTypingColumn(container) {
    if (!container) return null;
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(el);
    scrollSplitChats();
    return el;
  }

  function removeTyping(el) {
    if (el?.parentNode) el.remove();
  }

  function calculateDebateTokens() {
    let mainChars = 0;
    mainDebateLog.forEach(m => mainChars += (m.content || '').length);
    let secondChars = 0;
    secondBrainLog.forEach(m => secondChars += (m.content || '').length);

    const currentChars = mainChars + secondChars;
    const estimateFn = window.estimateTokens || (c => Math.ceil((c / 3.5) * 1.10));
    const formatFn = window.formatTokenCount || (t => t.toLocaleString());

    const currentTokens = estimateFn(currentChars);

    // Calculate average tokens per completed turn
    let avgTokensPerTurn = 350; // default baseline per exchange
    if (debateTurnCount > 0 && currentTokens > 0) {
      avgTokensPerTurn = Math.ceil(currentTokens / debateTurnCount);
    }

    const remainingTurns = Math.max(0, debateTargetLimit - debateTurnCount);
    const projectedTotalTokens = currentTokens + (remainingTurns * avgTokensPerTurn);

    return {
      currentTokens,
      formattedCurrent: formatFn(currentTokens),
      projectedTotalTokens,
      formattedProjected: formatFn(projectedTotalTokens)
    };
  }

  function updateDebateUI() {
    const counter = document.getElementById('debateCounter');
    const btnStop = document.getElementById('btnStopDebate');
    const btnContinue = document.getElementById('btnContinueDebate');
    const turnSelect = document.getElementById('debateTurnSelect');
    const tokenDisplay = document.getElementById('debateTurnTokens');
    const projectedDisplay = document.getElementById('debateProjectedTokens');

    if (counter) counter.textContent = `Turn ${debateTurnCount} / ${debateTargetLimit}`;

    const tokenStats = calculateDebateTokens();
    if (tokenDisplay) tokenDisplay.textContent = `Tokens: ~${tokenStats.formattedCurrent}`;
    if (projectedDisplay) projectedDisplay.textContent = `Projected Total: ~${tokenStats.formattedProjected}`;

    if (debateRunning) {
      if (btnStop) btnStop.classList.remove('hidden');
      if (btnContinue) btnContinue.classList.add('hidden');
      if (turnSelect) turnSelect.disabled = true;
    } else {
      if (btnStop) btnStop.classList.add('hidden');
      if (turnSelect) turnSelect.disabled = false;
      if (debateTurnCount >= debateTargetLimit && debateTurnCount > 0) {
        if (btnContinue) btnContinue.classList.remove('hidden');
      } else {
        if (btnContinue) btnContinue.classList.add('hidden');
      }
    }
  }

  async function runDebateFlow(promptText) {
    const sendBtn = document.getElementById('btnSend');
    const chatInp = document.getElementById('chatInput');
    const chatCMain = document.getElementById('chatContainerMain');
    const chatCSecond = document.getElementById('chatContainerSecond');

    if (!window.hasActiveApiKeyForModel) return;
    if (!window.hasActiveApiKeyForModel() || !window.hasActiveApiKeyForModel(window.secondBrainModel)) {
      const missingFor = !window.hasActiveApiKeyForModel() ? "Main model" : "Second Brain model";
      if (window.showToast) window.showToast(`⚠️ API key missing for ${missingFor}. Please check Settings.`);
      return;
    }
    if (debateRunning) return;
    debateRunning = true;
    debateStopRequested = false;
    window.waiting = true;
    if (sendBtn) sendBtn.disabled = true;
    if (chatInp) {
      chatInp.disabled = true;
      chatInp.value = '';
    }
    updateDebateUI();

    if (promptText && promptText.trim()) {
      mainDebateLog = [];
      secondBrainLog = [];
      lastInjectedDebateIndex = 0;
      debateTurnCount = 0;

      const userFormatted = `[User]: ${promptText.trim()}`;
      const userEntry = { timestamp: new Date().toISOString(), role: 'user', content: userFormatted };
      mainDebateLog.push(userEntry);
    }

    syncSplitChatViews();

    try {
      while (debateTurnCount < debateTargetLimit && !debateStopRequested) {
        debateTurnCount++;
        updateDebateUI();

        const remainingTurns = debateTargetLimit - debateTurnCount;
        const debateStatusHeader = `[DEBATE STATUS: Active Debate Mode | Constructive Teamwork Debate | Total set exchanges: ${debateTargetLimit} | Current exchange: ${debateTurnCount} of ${debateTargetLimit} (${remainingTurns} remaining) | KEEP EXCHANGES SHORT AND CONCISE. Main Thread holds full context and defends ideas; Second Brain enters blind. Main Thread must explain key context to Second Brain and tell Second Brain to keep replies short. Address the other AI directly ('Second Brain,' / 'Main Thread,'). Do not address the user directly.]`;
        const debateBottomHeaderMain = `DEBATE ACTIVE (Set to ${debateTargetLimit} exchanges total, exchange ${debateTurnCount}/${debateTargetLimit}). Keep your response short. Provide necessary context to Second Brain and remind it to keep its answers short. Address Second Brain directly. Do not summarize. Do not close unless outputting [END_DEBATE].`;
        const debateBottomHeaderSecond = `DEBATE ACTIVE (Set to ${debateTargetLimit} exchanges total, exchange ${debateTurnCount}/${debateTargetLimit}). Keep your response short, critical, and concise. Address Main Thread directly. Do not summarize. Do not close unless outputting [END_DEBATE].`;

        // --- Step A: Call Main Thread ---
        if (window.setStatusMessage) window.setStatusMessage(`🔥 Turn ${debateTurnCount}/${debateTargetLimit} — Main Thread thinking…`);
        const typingMain = showTypingColumn(chatCMain);
        const { prompt: baseSysPrompt } = window.buildSystemPrompt(true);
        const mainSysPrompt = `${debateStatusHeader}\n\n${MAIN_DEBATE_ROLE_SYS}\n\n${baseSysPrompt}\n\n${debateBottomHeaderMain}`;

        // Send only mainDebateLog for conversation history during debate
        const mainMsgs = [
          { role: 'system', content: mainSysPrompt },
          ...mainDebateLog.map((e, idx) => {
            if (idx === mainDebateLog.length - 1 && e.role === 'user') {
              return { role: e.role, content: `${debateStatusHeader}\n\n${e.content}\n\n${debateBottomHeaderMain}` };
            }
            return { role: e.role, content: e.content };
          })
        ];

        let mainReply = await window.callApiWithRetry(mainMsgs);
        removeTyping(typingMain);

        let mainEndDebateSignaled = false;
        if (mainReply.includes('[END_DEBATE]')) {
          mainEndDebateSignaled = true;
          mainReply = mainReply.replace(/\[END_DEBATE\]/g, '').trim();
        }

        let mainStoppedForClarification = false;
        if (mainReply.includes('%%%STOP')) {
          mainStoppedForClarification = true;
          mainReply = mainReply.replace(/%%%STOP/g, '').trim();
        }

        let { cleanedReply: mainCleaned } = window.processActions(mainReply);

        if (!/^second brain,/i.test(mainCleaned)) {
          mainCleaned = `Second Brain,\n\n${mainCleaned}`;
        }

        const lowerMain = mainCleaned.toLowerCase();
        const closingPhrasesPattern = /(in summary|the debate is closed|the debate is over|over and out|what we learned|that is my position|my final position|good luck)/i;
        const breakoutPhrasesPattern = /(want me to|i can give you|the user asked|shall i write|would you like me to|let me know if you want)/i;

        const isRuleViolation = (closingPhrasesPattern.test(lowerMain) || breakoutPhrasesPattern.test(lowerMain)) && !mainEndDebateSignaled && debateTurnCount < debateTargetLimit;

        if (isRuleViolation) {
          console.warn('[Debate Rule Violation Warning]: Main Thread attempted premature closure:', mainCleaned);

          if (chatCMain) {
            const sysWarnDiv = document.createElement('div');
            sysWarnDiv.className = 'chat-message system';
            sysWarnDiv.innerHTML = `<div class="msg-label">System Warning</div><div class="msg-content">⚠️ Main Thread attempted to end the debate early.<br><button class="btn-rerun-turn-ui" style="margin-top:8px; padding:4px 12px; background:var(--lavender-soft); border:1px solid var(--lavender); color:var(--lavender); border-radius:12px; cursor:pointer; font-size:0.75rem;">🔄 Re-run this turn</button></div>`;
            chatCMain.appendChild(sysWarnDiv);

            sysWarnDiv.querySelector('.btn-rerun-turn-ui').onclick = () => {
              sysWarnDiv.remove();
              runDebateFlow();
            };
          }

          if (window.setStatusMessage) window.setStatusMessage('⚠️ Debate paused: Main Thread attempted to end debate early.');
          if (window.showToast) window.showToast('Main Thread attempted to end debate early. Click Re-run turn to retry.');
          break;
        }

        const mainAssistantEntry = { timestamp: new Date().toISOString(), role: 'assistant', content: mainCleaned };
        mainDebateLog.push(mainAssistantEntry);
        appendBubbleColumn(chatCMain, 'assistant', mainCleaned, window.APP || 'The Adze');

        if (mainStoppedForClarification) {
          if (window.setStatusMessage) window.setStatusMessage('🛑 Debate paused: Main Thread requested user clarification.');
          appendBubbleColumn(chatCMain, 'system', '🛑 Main Thread requested user clarification. Debate paused.');
          if (window.showToast) window.showToast('Debate paused for user clarification.');
          break;
        }

        if (mainEndDebateSignaled) {
          if (window.setStatusMessage) window.setStatusMessage('✅ Debate Complete.');
          appendBubbleColumn(chatCMain, 'system', '✅ Debate Complete.');
          if (window.showToast) window.showToast('Debate Complete!');
          break;
        }

        if (debateStopRequested) {
          if (window.setStatusMessage) window.setStatusMessage('⏹️ Debate stopped by user.');
          break;
        }

        // --- Step B: Call Second Brain ---
        if (window.setStatusMessage) window.setStatusMessage(`🧠 Turn ${debateTurnCount}/${debateTargetLimit} — Second Brain thinking…`);
        const typingSecond = showTypingColumn(chatCSecond);

        const mainMsgForSecond = { timestamp: new Date().toISOString(), role: 'user', content: `[Main Thread]: ${mainCleaned}` };
        secondBrainLog.push(mainMsgForSecond);
        appendBubbleColumn(chatCSecond, 'user', `[Main Thread]: ${mainCleaned}`, 'Main Thread');

        const secondSysPrompt = `${debateStatusHeader}\n\n${SECOND_BRAIN_SYS}\n\n${debateBottomHeaderSecond}`;

        // Direct, lightweight prompt for Second Brain (no system context dump or history)
        const secondMsgs = [
          { role: 'system', content: secondSysPrompt },
          ...secondBrainLog.map(e => ({ role: e.role, content: e.content }))
        ];

        let secondReply = await window.callApiWithRetry(secondMsgs, 1, window.secondBrainModel);
        removeTyping(typingSecond);

        let secondStoppedForClarification = false;
        if (secondReply.includes('%%%STOP')) {
          secondStoppedForClarification = true;
          secondReply = secondReply.replace(/%%%STOP/g, '').trim();
        }

        if (!/^main thread,/i.test(secondReply)) {
          secondReply = `Main Thread,\n\n${secondReply}`;
        }

        const secondAssistantEntry = { timestamp: new Date().toISOString(), role: 'assistant', content: secondReply };
        secondBrainLog.push(secondAssistantEntry);
        appendBubbleColumn(chatCSecond, 'assistant', secondReply, 'Second Brain');

        if (secondStoppedForClarification) {
          if (window.setStatusMessage) window.setStatusMessage('🛑 Debate paused: Second Brain requested user clarification.');
          appendBubbleColumn(chatCSecond, 'system', '🛑 Second Brain requested user clarification. Debate paused.');
          if (window.showToast) window.showToast('Debate paused for user clarification.');
          break;
        }

        const secondMsgForMain = { timestamp: new Date().toISOString(), role: 'user', content: `[Second Brain]: ${secondReply}` };
        mainDebateLog.push(secondMsgForMain);
        appendBubbleColumn(chatCMain, 'user', `[Second Brain]: ${secondReply}`, 'Second Brain');

        if (debateStopRequested) {
          if (window.setStatusMessage) window.setStatusMessage('⏹️ Debate stopped by user.');
          break;
        }
      }
    } catch (err) {
      const errText = '⚠️ ' + (err.message || 'Error occurred during debate');
      if (window.setStatusMessage) window.setStatusMessage(errText);
      if (window.showToast) window.showToast(errText);
    } finally {
      debateRunning = false;
      window.waiting = false;
      if (sendBtn) sendBtn.disabled = false;
      if (chatInp) {
        chatInp.disabled = false;
        chatInp.focus();
      }
      injectMainDebateToChatLog();
      updateDebateUI();
      if (!debateStopRequested && debateTurnCount >= debateTargetLimit) {
        if (window.setStatusMessage) window.setStatusMessage(`✅ Debate turn limit reached (${debateTurnCount}/${debateTargetLimit}).`);
      }
    }
  }

  function initDebateModule() {
    const btnToggle = document.getElementById('btnDebateToggle');
    const turnSelect = document.getElementById('debateTurnSelect');
    const btnStop = document.getElementById('btnStopDebate');
    const btnContinue = document.getElementById('btnContinueDebate');
    const btnReset = document.getElementById('btnResetDebate');
    const secondBrainSelect = document.getElementById('debateSecondBrainModelSelect');

    if (btnToggle) btnToggle.addEventListener('click', () => toggleDebateMode());

    if (turnSelect) {
      turnSelect.addEventListener('change', (e) => {
        debateTargetLimit = parseInt(e.target.value, 10) || 4;
        updateDebateUI();
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', () => {
        if (debateRunning) {
          debateStopRequested = true;
          if (window.showToast) window.showToast('Stopping debate after current response finishes...');
          if (window.setStatusMessage) window.setStatusMessage('⏳ Stopping debate after current response finishes...');
        }
      });
    }

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        if (!debateRunning) {
          debateTargetLimit += 4;
          updateDebateUI();
          runDebateFlow();
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (!debateRunning) {
          mainDebateLog = [];
          secondBrainLog = [];
          debateTurnCount = 0;
          updateDebateUI();
          syncSplitChatViews();
          if (window.showToast) window.showToast('Debate view reset.');
        } else {
          if (window.showToast) window.showToast('Cannot reset debate while running.');
        }
      });
    }

    if (secondBrainSelect) {
      secondBrainSelect.addEventListener('change', (e) => {
        window.secondBrainModel = e.target.value;
        const secondBrainModelSelect = document.getElementById('secondBrainModelSelect');
        if (secondBrainModelSelect) secondBrainModelSelect.value = window.secondBrainModel;
        window.save('wc_secondBrainModel', window.secondBrainModel);
        if (window.showToast) window.showToast(`Second Brain model: ${window.secondBrainModel}`);
      });
    }
  }

  // Export debate state & functions to window
  window.toggleDebateMode = toggleDebateMode;
  window.runDebateFlow = runDebateFlow;
  window.initDebateModule = initDebateModule;
  window.syncSplitChatViews = syncSplitChatViews;
  window.updateDebateUI = updateDebateUI;
  Object.defineProperty(window, 'debateModeActive', {
    get: () => debateModeActive,
    set: (val) => { debateModeActive = val; }
  });
})(window);
