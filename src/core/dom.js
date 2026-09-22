'use strict';

// Referências aos elementos da interface.
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
const status=$('status'),stats=$('stats'),cursorLabel=$('cursorLabel'),modeLabel=$('modeLabel');
const jsonArea=$('jsonArea'),fileInput=$('fileInput'),levelName=$('levelName');
const snapSelect=$('snapSelect'),enemySpeed=$('enemySpeed');
const props=$('properties'),emptySelection=$('emptySelection'),selectedInfo=$('selectedInfo');
const wallProps=$('wallProps'),enemyProps=$('enemyProps'),staticProps=$('staticProps'),regularProps=$('regularProps'),guidedProps=$('guidedProps');
const wallW=$('wallW'),wallH=$('wallH'),editEnemySpeed=$('editEnemySpeed'),editMoveMode=$('editMoveMode');
const startX=$('startX'),startY=$('startY'),endX=$('endX'),endY=$('endY'),freeAngle=$('freeAngle'),freeAngleInput=$('freeAngleInput');
const routeInfo=$('routeInfo'),guidedSpeed=$('guidedSpeed');
const finishGuideBtn=$('finishGuideBtn'),cancelGuideBtn=$('cancelGuideBtn');
const resetCollectibles=$('resetCollectibles'),resetLogic=$('resetLogic'),resetEnemies=$('resetEnemies');
const autosaveLabel=$('autosaveLabel'), mapColsInput=$('mapCols'), mapRowsInput=$('mapRows');
const canvasWrap = canvas.closest('.canvasWrap');
const zoomOutBtn=$('zoomOutBtn'),zoomInBtn=$('zoomInBtn'),zoomResetBtn=$('zoomResetBtn');
const duplicateBtn=$('duplicateBtn'),copyBtn=$('copyBtn'),pasteBtn=$('pasteBtn'),validateBtn=$('validateBtn');
const duplicateSelectedBtn=$('duplicateSelectedBtn'),copySelectedBtn=$('copySelectedBtn');
const templateSelect=$('templateSelect'),loadTemplateBtn=$('loadTemplateBtn'),saveTemplateBtn=$('saveTemplateBtn'),deleteTemplateBtn=$('deleteTemplateBtn');
const runValidationBtn=$('runValidationBtn'),validationSummary=$('validationSummary'),validationList=$('validationList');
