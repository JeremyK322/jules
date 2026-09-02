// ── Memory Consolidation & Memory Editor Module ────────────────────
(function(window) {
  const memoryEditor = {
    isOpen: false,
    isRunning: false,
    originalWorkspaceText: '',
    commitments: [],
    outputs: {},
    stage1Diagnostic: '',
    stage1Skeleton: '',
    stage2Workspace: '',
    stage3ChangeLog: '',
    stage3QualityCheck: '',
  };

  function formatWorkspaceForEditor() {
    if (!window.aiDocs || !window.aiDocs.length) return '';
    return window.aiDocs.map(d => `### [${d.type.toUpperCase()}] ${d.title}\n${d.content}\n`).join('\n');
  }

  function loadCurrentWorkspace() {
    const memoryInput = document.getElementById('memoryInput');
    if (memoryInput) {
      memoryInput.value = formatWorkspaceForEditor();
      memoryEditor.originalWorkspaceText = memoryInput.value;
    }
    memoryEditor.commitments = (window.aiDocs || []).filter(d => d.type === 'commitment').map(d => d.content);
  }

  function openMemoryEditor() {
    memoryEditor.isOpen = true;
    memoryEditor.isRunning = false;
    memoryEditor.outputs = {};
    const memoryInput = document.getElementById('memoryInput');
    const memoryTitleInput = document.getElementById('memoryTitleInput');
    const memoryEditorOutputs = document.getElementById('memoryEditorOutputs');
    const memoryEditorProgress = document.getElementById('memoryEditorProgress');
    const memoryEditorOverlay = document.getElementById('memoryEditorOverlay');

    if (memoryInput) memoryInput.value = '';
    if (memoryTitleInput) memoryTitleInput.value = '';
    if (memoryEditorOutputs) memoryEditorOutputs.innerHTML = '';
    if (memoryEditorProgress) memoryEditorProgress.textContent = '';
    memoryEditor.originalWorkspaceText = '';
    memoryEditor.commitments = [];
    if (memoryEditorOverlay) memoryEditorOverlay.style.display = 'flex';
  }

  function closeMemoryEditor() {
    memoryEditor.isOpen = false;
    const memoryEditorOverlay = document.getElementById('memoryEditorOverlay');
    if (memoryEditorOverlay) memoryEditorOverlay.style.display = 'none';
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

  async function callMemoryAPI(prompt, options = {}) {
    const { model = window.secondBrainModel } = options;
    return await window.callApiWithRetry([{ role: 'user', content: prompt }], 1, model);
  }

  function buildMemoryPass0Prompt(workspace) {
    return `You are a memory consolidation assistant. You are given an AI workspace containing multiple memories, commitments, and notes.

Read the entire workspace and produce a diagnostic report:

1. Identify major themes and clusters of related entries.
2. Identify duplicate or near-duplicate entries.
3. Identify contradictions or stale entries.
4. Identify entries that should be treated as commitments and preserved verbatim.
5. Propose a logical grouping plan for merging entries into a consolidated workspace.

Do not rewrite or merge anything yet. Just diagnose. Take your time to think through the structure.\n\nWORKSPACE:\n${workspace}`;
  }

  function buildMemoryPass1Prompt(workspace, diagnostic) {
    return `You are a memory consolidation assistant. Merge and sort the following AI workspace entries into a single, clean, consolidated workspace document.

Rules:
- Group related entries under clear thematic headings.
- Preserve all commitments verbatim. Never summarise or reword them.
- For every merged section or paragraph, attach a source tag like [source: original-title-or-id].
- Do not delete information. If uncertain whether to merge, keep the entry separate and flag it.
- CRITICAL: Output ONLY the actual consolidated memory workspace document content. Do NOT output meta-reports, commentary, status summaries, or conversational preamble/postscript.\n\nDIAGNOSTIC:\n${diagnostic || 'No diagnostic available.'}\n\nWORKSPACE:\n${workspace}`;
  }

  function buildMemoryPass2Prompt(workspace, commitments) {
    let prompt = `You are a verification assistant. You are given the original commitments and a proposed consolidated workspace.

Check:
1. Every commitment appears word-for-word in the proposed workspace. Do not accept paraphrases.
2. No original entry appears to have been silently dropped without a trace.
3. Every section has at least one source tag.

If all checks pass, output exactly:
&&&PASSED&&&

If any check fails, output exactly:
&&&FAILED&&&
Then list what was missed or altered.\n\nCOMMITMENTS:\n`;
    commitments.forEach((c, i) => prompt += `[${i+1}] ${c}\n`);
    prompt += `\nPROPOSED WORKSPACE:\n${workspace}`;
    return prompt;
  }

  function buildMemoryPass3Prompt(workspace) {
    return `You are a memory consolidation formatter. Take the following consolidated workspace and produce a clean final version.

Rules:
- Keep all source tags.
- Remove redundant repetition of source tags within the same paragraph if possible, but do not lose traceability.
- Ensure headings are consistent.
- Output only the final formatted workspace, no preamble.\n\nWORKSPACE:\n${workspace}`;
  }

  function updateMemoryPassOutputUI(passNum, displayText, passTitle) {
    const outputDiv = document.getElementById('memoryEditorOutputs');
    if (!outputDiv) return;
    let details = outputDiv.querySelector(`details[data-pass="${passNum}"]`);
    if (!details) {
      details = document.createElement('details');
      details.className = 'memory-editor-pass-output';
      details.dataset.pass = passNum;
      const summary = document.createElement('summary');
      summary.textContent = passTitle || `Pass ${passNum}: ${['Diagnostic','Sort & Merge','Verify','Final Format'][passNum]}`;
      details.appendChild(summary);
      outputDiv.appendChild(details);
    }
    if (passTitle) {
      const sum = details.querySelector('summary');
      if (sum) sum.textContent = passTitle;
    }
    let pre = details.querySelector('pre');
    if (!pre) {
      pre = document.createElement('pre');
      details.appendChild(pre);
    }
    pre.textContent = displayText || '';
    details.open = true;
  }

  function enforceConsolidationMarkerLockout(text) {
    let clean = text;
    const markerRegex = /###\s*(ADD|UPDATE|DELETE):\s*(.+?)\s*\n([\s\S]*?)###\s*END/gi;
    if (markerRegex.test(text)) {
      console.warn('[Consolidation Warning]: Memory markers detected during consolidation! Stripping markers.');
      clean = text.replace(markerRegex, '').trim();
      if (window.showToast) window.showToast('⚠️ Memory markers stripped during consolidation pass.');
    }
    return clean;
  }

  async function runStage1SecondBrain() {
    if (memoryEditor.isRunning) return;
    const memoryInput = document.getElementById('memoryInput');
    const memoryEditorProgress = document.getElementById('memoryEditorProgress');
    const rawWorkspace = memoryEditor.originalWorkspaceText || (memoryInput ? memoryInput.value.trim() : '');

    if (!rawWorkspace) {
      if (window.showToast) window.showToast('Load or paste workspace text first.');
      return;
    }

    memoryEditor.isRunning = true;
    updateStageStepper(1);

    const sbRolePrompt = "You are the structural critic. You have no memory of past work with the user beyond what is in this input. Your job is to find the weak spots in the raw memory text. You do not create the final. You do not merge contradictions. You flag. You propose. Keep answers structured. End at the skeleton.";

    try {
      const header1 = "[MEMORY CONSOLIDATION ACTIVE | Stage 1 of 3: Second Brain structural critique | Pass 1 of 2. Output is a proposal only. Do not emit ADD, UPDATE, or DELETE markers. Your role in this pass: diagnose weak spots.]";
      if (memoryEditorProgress) memoryEditorProgress.textContent = '⚡ Stage 1 (Pass 1/2): Second Brain diagnostic scan...';
      const stage1DiagPrompt = `${header1}\n\n${sbRolePrompt}\n\nTask: Perform a strict diagnostic scan on this RAW WORKSPACE.\n\nScrutinize and report on:\n1. Duplicate or near-duplicate blocks.\n2. Contradictory statuses or conflicting facts.\n3. Stale triggers or outdated reminders.\n4. Privacy leaks or sensitive disclosures.\n5. Unresolved open flags.\n\nRAW WORKSPACE:\n${rawWorkspace}`;

      let diagOutput = await callMemoryAPI(stage1DiagPrompt, { model: window.secondBrainModel, thinking: true, maxTokens: window.getTokenLimit(window.secondBrainModel) });
      diagOutput = enforceConsolidationMarkerLockout(diagOutput);

      if (diagOutput.includes('%%%STOP')) {
        memoryEditor.stage1Diagnostic = diagOutput.replace(/%%%STOP/g, '').trim();
        if (memoryEditorProgress) memoryEditorProgress.textContent = '🛑 Stage 1 paused: Second Brain requested clarification (%%%STOP).';
        return;
      }
      memoryEditor.stage1Diagnostic = diagOutput;

      const header2 = "[MEMORY CONSOLIDATION ACTIVE | Stage 1 of 3: Second Brain structural critique | Pass 2 of 2. Output is a proposal only. End at skeleton. Do not emit ADD, UPDATE, or DELETE markers.]";
      if (memoryEditorProgress) memoryEditorProgress.textContent = '⚡ Stage 1 (Pass 2/2): Constructing proposed lean skeleton...';
      const stage1SkelPrompt = `${header2}\n\n${sbRolePrompt}\n\nTask: Based on your diagnostic scan, construct a PROPOSED LEAN SKELETON of the workspace and an ARCHIVE/DELETE list. End at the skeleton. Do not produce a final workspace.\n\nDIAGNOSTIC:\n${diagOutput}\n\nRAW WORKSPACE:\n${rawWorkspace}`;

      let skelOutput = await callMemoryAPI(stage1SkelPrompt, { model: window.secondBrainModel, thinking: true, maxTokens: window.getTokenLimit(window.secondBrainModel) });
      skelOutput = enforceConsolidationMarkerLockout(skelOutput);

      if (skelOutput.includes('%%%STOP')) {
        memoryEditor.stage1Skeleton = skelOutput.replace(/%%%STOP/g, '').trim();
        if (memoryEditorProgress) memoryEditorProgress.textContent = '🛑 Stage 1 paused: Second Brain requested clarification (%%%STOP).';
        return;
      }
      memoryEditor.stage1Skeleton = skelOutput;

      const combinedProposal = `### Second Brain Diagnostic (Pass 1/2)\n${diagOutput}\n\n---\n\n### Second Brain Proposed Skeleton & Archive List (Pass 2/2)\n${skelOutput}`;
      renderMemoryReportTab('sb_proposal', combinedProposal);

      if (memoryEditorProgress) memoryEditorProgress.textContent = '⏸️ Stage 1 Complete! Review Second Brain Proposal, then click "Stage 2: Adze Review".';
      if (window.showToast) window.showToast('Stage 1 Complete!');
    } catch (e) {
      if (memoryEditorProgress) memoryEditorProgress.textContent = `Stage 1 failed: ${e.message}`;
    } finally {
      memoryEditor.isRunning = false;
    }
  }

  async function runStage2AdzeReview(correctionInstruction) {
    if (memoryEditor.isRunning) return;
    const memoryInput = document.getElementById('memoryInput');
    const memoryEditorProgress = document.getElementById('memoryEditorProgress');
    const editorLeftLabel = document.getElementById('editorLeftLabel');
    const rawWorkspace = memoryEditor.originalWorkspaceText || (memoryInput ? memoryInput.value.trim() : '');
    const skelOutput = memoryEditor.stage1Skeleton || memoryEditor.stage1Diagnostic;

    if (!skelOutput && !correctionInstruction) {
      if (window.showToast) window.showToast('Please run Stage 1: SB Diagnosis first.');
      return;
    }

    memoryEditor.isRunning = true;
    updateStageStepper(2);
    if (memoryEditorProgress) {
      memoryEditorProgress.textContent = correctionInstruction
        ? '⚡ Stage 2 (Pass 1/1): Re-running Stage 2 with user correction...'
        : '⚡ Stage 2 (Pass 1/1): The Adze resolving flags with full session history & documents...';
    }

    const adzeRolePrompt = "You are the reviewer. You have full context. You resolve the Second Brain's flags using the chat history and documents. You decide what is archived, merged, or deleted. You write the change log. Your output is a draft, not a commitment. Do not emit memory tags during this stage. The user approves or rejects what you produce.";
    const headerStage2 = "[MEMORY CONSOLIDATION ACTIVE | Stage 2 of 3: Adze review | Pass 1 of 1. Output is a draft for user approval. Not committed memory. Do not emit ADD, UPDATE, or DELETE markers.]";

    try {
      const { prompt: baseSys } = window.buildSystemPrompt(true);
      const adzeSysPrompt = `${headerStage2}\n\n${adzeRolePrompt}\n\n${baseSys}`;
      let stage2UserPrompt = `[Memory Consolidation Stage 2 Request]:
The Second Brain has analyzed our workspace with ZERO context and generated the following proposed changes and archive list:

SECOND BRAIN PROPOSED SKELETON & DIAGNOSTIC:
${skelOutput || 'None'}

RAW WORKSPACE:
${rawWorkspace}

YOUR TASK AS THE ADZE (With full chat history & permanent documents):
1. Resolve conflicts Second Brain flagged by checking our actual conversation context and commitments.
2. Produce the DRAFT CONSOLIDATED WORKSPACE text under the header "## Consolidated Workspace Draft".
3. Produce a detailed CHANGE LOG (what was merged, archived, deleted, or kept open) under the header "## Consolidation Change Log".`;

      if (correctionInstruction) {
        stage2UserPrompt += `\n\nUSER CORRECTION INSTRUCTION:\n${correctionInstruction}`;
      }

      const stage2Output = await window.callApi([
        { role: 'system', content: adzeSysPrompt },
        ...window.chatLog.map(e => ({ role: e.role, content: e.content })),
        { role: 'user', content: stage2UserPrompt }
      ]);

      let cleanedOutput = enforceConsolidationMarkerLockout(stage2Output);

      if (cleanedOutput.includes('%%%STOP')) {
        cleanedOutput = cleanedOutput.replace(/%%%STOP/g, '').trim();
        if (memoryEditorProgress) memoryEditorProgress.textContent = '🛑 Stage 2 paused: The Adze requested clarification (%%%STOP).';
      }

      let finalWorkspace = cleanedOutput;
      let changeLogText = cleanedOutput;
      if (cleanedOutput.includes('## Consolidated Workspace Draft') && cleanedOutput.includes('## Consolidation Change Log')) {
        const parts = cleanedOutput.split('## Consolidation Change Log');
        finalWorkspace = parts[0].replace('## Consolidated Workspace Draft', '').trim();
        changeLogText = '## Consolidation Change Log\n' + parts[1].trim();
      }

      memoryEditor.stage2Workspace = finalWorkspace;
      memoryEditor.stage3ChangeLog = changeLogText;
      if (memoryInput) memoryInput.value = finalWorkspace;
      if (editorLeftLabel) editorLeftLabel.textContent = 'Draft Consolidated Workspace (Pending Approval)';

      renderMemoryReportTab('change_log', changeLogText);

      if (memoryEditorProgress) memoryEditorProgress.textContent = '⏸️ Stage 2 Complete! Click "Stage 3: QC Check".';
      if (window.showToast) window.showToast('Stage 2 Complete!');
    } catch (e) {
      if (memoryEditorProgress) memoryEditorProgress.textContent = `Stage 2 failed: ${e.message}`;
    } finally {
      memoryEditor.isRunning = false;
    }
  }

  async function runStage3QualityCheck() {
    if (memoryEditor.isRunning) return;
    const memoryInput = document.getElementById('memoryInput');
    const memoryEditorProgress = document.getElementById('memoryEditorProgress');
    const finalWorkspace = memoryEditor.stage2Workspace || (memoryInput ? memoryInput.value.trim() : '');

    if (!finalWorkspace) {
      if (window.showToast) window.showToast('No consolidated workspace text to check. Run Stage 2 first.');
      return;
    }

    memoryEditor.isRunning = true;
    updateStageStepper(3);
    if (memoryEditorProgress) memoryEditorProgress.textContent = '⚡ Stage 3 (Pass 1/1): Format & Structural Release Gate check...';

    const headerStage3 = "[MEMORY CONSOLIDATION ACTIVE | Stage 3 of 3: Format & Release Gate | Pass 1 of 1. Output is structural check only. Not committed memory. Do not emit ADD, UPDATE, or DELETE markers.]";

    try {
      const qcPrompt = `${headerStage3}\n\nTask: Perform a structural quality check on this draft workspace. Check for formatting errors, unparsed markers, or structural duplications. Do NOT re-think content. Be direct.\n\nDRAFT WORKSPACE:\n${finalWorkspace}`;
      let qcOutput = await callMemoryAPI(qcPrompt, { model: window.secondBrainModel, thinking: false, temperature: 0.2, maxTokens: window.getTokenLimit(window.secondBrainModel) });
      qcOutput = enforceConsolidationMarkerLockout(qcOutput);

      memoryEditor.stage3QualityCheck = qcOutput;
      renderMemoryReportTab('quality_check', qcOutput);
      renderPreCommitChecklist();

      if (memoryEditorProgress) memoryEditorProgress.textContent = '✅ Stage 3 Complete! Review Pre-Commit Checklist below, then click "Approve & Commit".';
      if (window.showToast) window.showToast('Stage 3 QC Complete! Pending User Approval.');
    } catch (e) {
      if (memoryEditorProgress) memoryEditorProgress.textContent = `Stage 3 failed: ${e.message}`;
    } finally {
      memoryEditor.isRunning = false;
    }
  }

  function renderPreCommitChecklist() {
    const outputs = document.getElementById('memoryEditorOutputs');
    if (!outputs) return;
    const changeLog = memoryEditor.stage3ChangeLog || 'No change log generated.';
    const archiveLength = (window.aiDocsArchive || []).length;
    const checklistHTML = `
<div style="background:var(--bg-elevated); padding:12px; border-radius:6px; border:1px solid var(--border-accent); margin-top:10px;">
  <h4 style="color:var(--lavender); margin-bottom:8px;">📋 Pre-Commit Checklist (Pending User Approval)</h4>
  <p><strong>Version:</strong> Consolidated Workspace v${archiveLength + 1}</p>
  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  <hr style="border-color:var(--border-subtle); margin:8px 0;">
  <div style="max-height:180px; overflow-y:auto; font-size:0.75rem;">
    <strong>Change Log & Audit Trail:</strong>
    <pre style="white-space:pre-wrap; margin-top:4px;">${window.esc ? window.esc(changeLog) : changeLog}</pre>
  </div>
</div>`;
    outputs.innerHTML += checklistHTML;
  }

  async function runThreeStageRelayPipeline() {
    await runStage1SecondBrain();
    if (memoryEditor.stage1Skeleton || memoryEditor.stage1Diagnostic) {
      await runStage2AdzeReview();
      if (memoryEditor.stage2Workspace) {
        await runStage3QualityCheck();
      }
    }
  }

  function sendProposalToChat() {
    const chatInput = document.getElementById('chatInput');
    const proposal = memoryEditor.stage1Skeleton || memoryEditor.stage1Diagnostic;
    if (!proposal) {
      if (window.showToast) window.showToast('No Second Brain proposal available yet. Run Stage 1 first.');
      return;
    }
    closeMemoryEditor();
    const chatPrompt = `Here is Second Brain's proposed memory consolidation critique and skeleton (context-stripped). Let's review and discuss these open flags before committing:\n\n${proposal}`;
    if (chatInput) chatInput.value = chatPrompt;
    if (window.showToast) window.showToast('Proposal pasted into chat. Hit Send to discuss with The Adze!');
  }

  function updateStageStepper(stage) {
    for (let i = 1; i <= 3; i++) {
      const tag = document.getElementById(`stepTag${i}`);
      if (!tag) continue;
      if (i === stage) {
        tag.style.background = 'var(--accent-color)';
        tag.style.color = '#fff';
        tag.style.fontWeight = '600';
      } else if (i < stage) {
        tag.style.background = 'var(--surface-dark)';
        tag.style.color = 'var(--text-secondary)';
        tag.style.fontWeight = 'normal';
      } else {
        tag.style.background = 'var(--chip-bg)';
        tag.style.color = 'var(--text-muted)';
        tag.style.fontWeight = 'normal';
      }
    }
  }

  function renderMemoryReportTab(tabKey, content) {
    const outputs = document.getElementById('memoryEditorOutputs');
    if (!outputs) return;
    if (!content) content = 'No report output available for this stage yet.';
    outputs.innerHTML = `<div style="white-space:pre-wrap; font-family:sans-serif; line-height:1.5;">${window.esc ? window.esc(content) : content}</div>`;
  }

  async function runMemoryPass(passNum) {
    if (memoryEditor.isRunning) return;
    const memoryInput = document.getElementById('memoryInput');
    const memoryEditorProgress = document.getElementById('memoryEditorProgress');
    const workspace = memoryInput ? memoryInput.value.trim() : '';
    if (!workspace) {
      if (window.showToast) window.showToast('Load or paste workspace text first.');
      return;
    }
    memoryEditor.isRunning = true;
    memoryEditor.isOpen = true;
    if (memoryEditorProgress) memoryEditorProgress.textContent = `Running Pass ${passNum}...`;

    try {
      let output = '';
      let prompt = '';
      let options = {};
      switch (passNum) {
        case 0:
          prompt = buildMemoryPass0Prompt(workspace);
          options = { thinking: true, reasoningEffort: 'high', maxTokens: window.getTokenLimit(window.secondBrainModel) };
          output = await callMemoryAPI(prompt, options);
          memoryEditor.outputs[0] = output;
          updateMemoryPassOutputUI(0, output);
          break;
        case 1: {
          const diagnostic = memoryEditor.outputs[0] || '';
          prompt = buildMemoryPass1Prompt(workspace, diagnostic);
          options = { thinking: false, temperature: 0.2, maxTokens: window.getTokenLimit(window.secondBrainModel) };
          output = await callMemoryAPI(prompt, options);
          memoryEditor.outputs[1] = output;
          if (memoryInput) memoryInput.value = output;
          updateMemoryPassOutputUI(1, output);
          break;
        }
        case 2: {
          const commitments = memoryEditor.commitments.length ? memoryEditor.commitments : window.aiDocs.filter(d => d.type === 'commitment').map(d => d.content);
          prompt = buildMemoryPass2Prompt(workspace, commitments);
          options = { thinking: true, reasoningEffort: 'low', maxTokens: window.getTokenLimit(window.secondBrainModel) };
          output = await callMemoryAPI(prompt, options);
          memoryEditor.outputs[2] = output;
          updateMemoryPassOutputUI(2, output);
          break;
        }
        case 3: {
          prompt = buildMemoryPass3Prompt(workspace);
          options = { thinking: false, temperature: 0.2, maxTokens: window.getTokenLimit(window.secondBrainModel) };
          output = await callMemoryAPI(prompt, options);
          memoryEditor.outputs[3] = output;
          if (memoryInput) memoryInput.value = output;
          updateMemoryPassOutputUI(3, output);
          break;
        }
      }
      if (memoryEditorProgress) memoryEditorProgress.textContent = `Pass ${passNum} complete.`;
    } catch (e) {
      if (memoryEditorProgress) memoryEditorProgress.textContent = `Pass ${passNum} failed: ${e.message}`;
      updateMemoryPassOutputUI(passNum, `Error: ${e.message}`);
    } finally {
      memoryEditor.isRunning = false;
    }
  }

  function saveMemoryWorkspace() {
    const memoryInput = document.getElementById('memoryInput');
    const memoryTitleInput = document.getElementById('memoryTitleInput');
    const finalText = memoryInput ? memoryInput.value.trim() : '';
    if (!finalText) {
      if (window.showToast) window.showToast('No workspace text to save.');
      return;
    }
    if (!window.aiDocsArchive) window.aiDocsArchive = [];
    window.aiDocsArchive.push([...(window.aiDocs || [])]);
    window.save('wc_aiDocsArchive', window.aiDocsArchive);

    const title = (memoryTitleInput ? memoryTitleInput.value.trim() : '') || 'Consolidated Workspace ' + new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
    window.aiDocs = [{
      id: 'ai_' + Date.now() + Math.random().toString(36),
      title,
      type: 'memory',
      content: finalText,
      timestamp: new Date().toISOString(),
      inPrompt: true
    }];
    window.save('wc_aiDocs', window.aiDocs);
    if (window.renderAiWorkspace) window.renderAiWorkspace();
    if (window.updateContextBar) window.updateContextBar();
    if (window.autoSave) window.autoSave();
    showUndoButtonIfArchive();
    closeMemoryEditor();
    if (window.showToast) window.showToast('Workspace saved. Editor closed.');
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

  function rejectConsolidation() {
    const memoryInput = document.getElementById('memoryInput');
    const memoryEditorOutputs = document.getElementById('memoryEditorOutputs');
    if (memoryEditor.originalWorkspaceText && memoryInput) {
      memoryInput.value = memoryEditor.originalWorkspaceText;
    }
    memoryEditor.stage1Diagnostic = '';
    memoryEditor.stage1Skeleton = '';
    memoryEditor.stage2Workspace = '';
    memoryEditor.stage3ChangeLog = '';
    memoryEditor.stage3QualityCheck = '';
    if (memoryEditorOutputs) {
      memoryEditorOutputs.innerHTML = '<div style="color:var(--text-muted); font-style:italic; padding:20px; text-align:center;">Consolidation rejected by user. Raw workspace kept unchanged.</div>';
    }
    closeMemoryEditor();
    if (window.showToast) window.showToast('❌ Consolidation rejected. Original workspace kept unchanged.');
  }

  async function applyCorrectionAndRerunStage2() {
    const correctionInput = document.getElementById('memoryCorrectionInput');
    const correction = correctionInput ? correctionInput.value.trim() : '';
    if (!correction) {
      if (window.showToast) window.showToast('Please type a correction instruction first.');
      return;
    }
    await runStage2AdzeReview(correction);
    if (memoryEditor.stage2Workspace) {
      await runStage3QualityCheck();
    }
  }

  function initMemoryModule() {
    const btnOpen = document.getElementById('btnOpenMemoryEditor');
    const btnClose = document.getElementById('btnCloseMemoryEditor');
    const btnCancel = document.getElementById('btnCancelMemoryEditor');
    const btnLoad = document.getElementById('btnLoadWorkspace');
    const btnApprove = document.getElementById('btnApproveCommitWorkspace');
    const btnReject = document.getElementById('btnRejectConsolidation');
    const btnApplyCorrection = document.getElementById('btnApplyCorrectionStage2');
    const btnUndo = document.getElementById('btnUndoConsolidation');
    const overlay = document.getElementById('memoryEditorOverlay');

    if (btnOpen) btnOpen.addEventListener('click', openMemoryEditor);
    if (btnClose) btnClose.addEventListener('click', closeMemoryEditor);
    if (btnCancel) btnCancel.addEventListener('click', closeMemoryEditor);
    if (btnLoad) btnLoad.addEventListener('click', loadCurrentWorkspace);
    if (btnApprove) btnApprove.addEventListener('click', saveMemoryWorkspace);
    if (btnReject) btnReject.addEventListener('click', rejectConsolidation);
    if (btnApplyCorrection) btnApplyCorrection.addEventListener('click', applyCorrectionAndRerunStage2);
    if (btnUndo) btnUndo.addEventListener('click', undoLastConsolidation);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMemoryEditor();
      });
    }

    const btnStage1 = document.getElementById('btnRunStage1');
    const btnStage2 = document.getElementById('btnRunStage2');
    const btnStage3 = document.getElementById('btnRunStage3');
    const btnRelay = document.getElementById('btnRunRelayPipeline');
    const btnProposalChat = document.getElementById('btnSendProposalToChat');

    if (btnStage1) btnStage1.addEventListener('click', runStage1SecondBrain);
    if (btnStage2) btnStage2.addEventListener('click', () => runStage2AdzeReview());
    if (btnStage3) btnStage3.addEventListener('click', runStage3QualityCheck);
    if (btnRelay) btnRelay.addEventListener('click', runThreeStageRelayPipeline);
    if (btnProposalChat) btnProposalChat.addEventListener('click', sendProposalToChat);

    const btnTabInput = document.getElementById('btnTabInput');
    const btnTabSecondBrain = document.getElementById('btnTabSecondBrain');
    const btnTabAdzeWorkspace = document.getElementById('btnTabAdzeWorkspace');
    const btnTabChangeLog = document.getElementById('btnTabChangeLog');
    const btnTabQualityCheck = document.getElementById('btnTabQualityCheck');

    if (btnTabInput) {
      btnTabInput.addEventListener('click', () => {
        const memoryInput = document.getElementById('memoryInput');
        const editorLeftLabel = document.getElementById('editorLeftLabel');
        if (memoryInput) memoryInput.value = memoryEditor.originalWorkspaceText || '';
        if (editorLeftLabel) editorLeftLabel.textContent = 'Raw Workspace Input';
      });
    }
    if (btnTabSecondBrain) {
      btnTabSecondBrain.addEventListener('click', () => {
        renderMemoryReportTab('sb_proposal', `### Second Brain Diagnostic\n${memoryEditor.stage1Diagnostic || 'Not run yet.'}\n\n---\n\n### Second Brain Proposed Skeleton & Archive List\n${memoryEditor.stage1Skeleton || 'Not run yet.'}`);
      });
    }
    if (btnTabAdzeWorkspace) {
      btnTabAdzeWorkspace.addEventListener('click', () => {
        const memoryInput = document.getElementById('memoryInput');
        const editorLeftLabel = document.getElementById('editorLeftLabel');
        if (memoryInput) memoryInput.value = memoryEditor.stage2Workspace || memoryEditor.originalWorkspaceText || '';
        if (editorLeftLabel) editorLeftLabel.textContent = 'Final Consolidated Workspace (The Adze)';
      });
    }
    if (btnTabChangeLog) {
      btnTabChangeLog.addEventListener('click', () => {
        renderMemoryReportTab('change_log', memoryEditor.stage3ChangeLog || 'No change log generated yet.');
      });
    }
    if (btnTabQualityCheck) {
      btnTabQualityCheck.addEventListener('click', () => {
        renderMemoryReportTab('quality_check', memoryEditor.stage3QualityCheck || 'No quality check run yet.');
      });
    }

    showUndoButtonIfArchive();

    const btnOpenDirect = document.getElementById('btnOpenDirectMemory');
    const btnCloseDirect = document.getElementById('btnCloseDirectMemory');
    const btnCancelDirect = document.getElementById('btnCancelDirectMemory');
    const btnCommitDirect = document.getElementById('btnCommitDirectMemory');
    const directOverlay = document.getElementById('directMemoryOverlay');

    if (btnOpenDirect) btnOpenDirect.addEventListener('click', openDirectMemoryModal);
    if (btnCloseDirect) btnCloseDirect.addEventListener('click', closeDirectMemoryModal);
    if (btnCancelDirect) btnCancelDirect.addEventListener('click', closeDirectMemoryModal);
    if (btnCommitDirect) btnCommitDirect.addEventListener('click', commitDirectMemoryReplace);
    if (directOverlay) {
      directOverlay.addEventListener('click', (e) => {
        if (e.target === directOverlay) closeDirectMemoryModal();
      });
    }
  }

  // Export functions to window
  window.memoryEditor = memoryEditor;
  window.initMemoryModule = initMemoryModule;
  window.showUndoButtonIfArchive = showUndoButtonIfArchive;
  window.undoLastConsolidation = undoLastConsolidation;
  window.openMemoryEditor = openMemoryEditor;
  window.closeMemoryEditor = closeMemoryEditor;
})(window);
