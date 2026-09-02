// ── Direct Memory Replacement & Permanent Workspace Module ────────────────────
(function(window) {
  function formatWorkspaceForEditor() {
    if (!window.aiDocs || !window.aiDocs.length) return '';
    return window.aiDocs.map(d => `### [${d.type.toUpperCase()}] ${d.title}\n${d.content}\n`).join('\n');
  }

  function openDirectMemoryModal() {
    const directOverlay = document.getElementById('directMemoryOverlay');
    const directInput = document.getElementById('directMemoryInput');
    const directTitleInput = document.getElementById('directMemoryTitleInput');
    if (directInput) {
      directInput.value = formatWorkspaceForEditor();
    }
    if (directTitleInput) directTitleInput.value = '';
    if (directOverlay) directOverlay.style.display = 'flex';
  }

  function closeDirectMemoryModal() {
    const directOverlay = document.getElementById('directMemoryOverlay');
    if (directOverlay) directOverlay.style.display = 'none';
  }

  function commitDirectMemoryReplace() {
    const directInput = document.getElementById('directMemoryInput');
    const directTitleInput = document.getElementById('directMemoryTitleInput');
    const pastedText = directInput ? directInput.value.trim() : '';

    if (!pastedText) {
      if (window.showToast) window.showToast('Please paste memory content first.');
      return;
    }

    if (!window.aiDocsArchive) window.aiDocsArchive = [];
    window.aiDocsArchive.push([...(window.aiDocs || [])]);
    window.save('wc_aiDocsArchive', window.aiDocsArchive);

    const title = (directTitleInput ? directTitleInput.value.trim() : '') || 'Consolidated Permanent Memory';
    window.aiDocs = [{
      id: 'ai_' + Date.now() + Math.random().toString(36),
      title,
      type: 'memory',
      content: pastedText,
      timestamp: new Date().toISOString(),
      inPrompt: true
    }];

    window.save('wc_aiDocs', window.aiDocs);
    if (window.renderAiWorkspace) window.renderAiWorkspace();
    if (window.updateContextBar) window.updateContextBar();
    if (window.autoSave) window.autoSave();
    showUndoButtonIfArchive();
    closeDirectMemoryModal();
    if (window.showToast) window.showToast('Existing memories removed & replaced with pasted content!');
  }

  function showUndoButtonIfArchive() {
    const btn = document.getElementById('btnUndoConsolidation');
    if (!btn) return;
    if (window.aiDocsArchive && window.aiDocsArchive.length > 0) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }

  function undoLastConsolidation() {
    if (!window.aiDocsArchive || window.aiDocsArchive.length === 0) {
      if (window.showToast) window.showToast('No workspace save to undo.');
      return;
    }
    const previous = window.aiDocsArchive.pop();
    window.aiDocs = previous;
    window.save('wc_aiDocs', window.aiDocs);
    window.save('wc_aiDocsArchive', window.aiDocsArchive);
    if (window.renderAiWorkspace) window.renderAiWorkspace();
    if (window.updateContextBar) window.updateContextBar();
    if (window.autoSave) window.autoSave();
    showUndoButtonIfArchive();
    if (window.showToast) window.showToast('Undid last workspace save.');
  }

  function initMemoryModule() {
    showUndoButtonIfArchive();

    const btnOpenDirect = document.getElementById('btnOpenDirectMemory');
    const btnCloseDirect = document.getElementById('btnCloseDirectMemory');
    const btnCancelDirect = document.getElementById('btnCancelDirectMemory');
    const btnCommitDirect = document.getElementById('btnCommitDirectMemory');
    const btnUndo = document.getElementById('btnUndoConsolidation');
    const directOverlay = document.getElementById('directMemoryOverlay');

    if (btnOpenDirect) btnOpenDirect.addEventListener('click', openDirectMemoryModal);
    if (btnCloseDirect) btnCloseDirect.addEventListener('click', closeDirectMemoryModal);
    if (btnCancelDirect) btnCancelDirect.addEventListener('click', closeDirectMemoryModal);
    if (btnCommitDirect) btnCommitDirect.addEventListener('click', commitDirectMemoryReplace);
    if (btnUndo) btnUndo.addEventListener('click', undoLastConsolidation);
    if (directOverlay) {
      directOverlay.addEventListener('click', (e) => {
        if (e.target === directOverlay) closeDirectMemoryModal();
      });
    }
  }

  // Export functions to window
  window.initMemoryModule = initMemoryModule;
  window.showUndoButtonIfArchive = showUndoButtonIfArchive;
  window.undoLastConsolidation = undoLastConsolidation;
  window.openDirectMemoryModal = openDirectMemoryModal;
  window.closeDirectMemoryModal = closeDirectMemoryModal;
})(window);
