// ============================================================
// CUTSCENE SYSTEM - DROGARIA RUNNER (v. Pro) - CORRIGIDO
// ============================================================

const CutsceneSystem = {
    isActive: false,
    onComplete: null,
    textInterval: null,
    preloadedVideos: {},
    
    // Configurações de Diálogos (Sincronizados com os vídeos)
    texts: {
        inicio: [
            "Hoje a cidade está sem entregador de plantão.",
            "Farmácias cheias, pacientes esperando remédio.",
            "Você é o único que conhece todos os atalhos.",
            "Corra, desvie do trânsito e entregue o máximo!",
            "Preparado? O plantão começou."
        ],
        especial: [
            "MODO TURBO ATIVADO!",
            "Sua velocidade aumentou drasticamente!",
            "Aproveite a vantagem para coletar tudo!",
            "A saúde não pode esperar!"
        ],
        gameover: [
            "Essa entrega não chegou a tempo...",
            "O paciente teve que esperar um pouco mais.",
            "Mas o plantão ainda não acabou.",
            "Respire fundo e tente outra vez."
        ],
        novafase: [
            "Suas entregas chamaram atenção na cidade.",
            "Um novo bairro foi liberado.",
            "Novas rotas. Mais perigo. Mais responsabilidade.",
            "Prepare-se para o próximo plantão."
        ],
        ranking: [
            "O mural da farmácia guarda os maiores plantonistas.",
            "Cada ponto representa uma entrega importante.",
            "Seu nome já entrou no ranking.",
            "Agora chegue ao topo."
        ]
    },

    init() {
        this.overlay = document.getElementById('cutsceneOverlay');
        this.video = document.getElementById('cutsceneVideo');
        this.dialogue = document.getElementById('cutsceneDialogue');
        this.textElement = document.getElementById('cutsceneText');
        this.skipBtn = document.getElementById('skipCutsceneBtn');
        this.nextBtn = document.getElementById('nextCutsceneBtn');

        if (!this.overlay || !this.video) {
            console.warn('CutsceneSystem: Elementos não encontrados no DOM');
            return;
        }

        // Estética Profissional
        this.overlay.style.background = "radial-gradient(circle, rgba(0,20,10,1) 0%, rgba(0,0,0,1) 100%)";
        this.video.style.boxShadow = "0 0 60px rgba(46, 204, 64, 0.5)";
        this.video.style.border = "3px solid rgba(46, 204, 64, 0.3)";
        this.video.style.transition = "transform 0.5s ease";

        this.video.onended = () => {
            // Se o vídeo acabar, mostra o botão de próximo se ainda não estiver visível
            if (this.nextBtn) this.nextBtn.style.display = 'block';
        };
        this.video.onerror = (e) => {
            console.error('CutsceneSystem: Erro no vídeo', e);
            this.end();
        };

        this.overlay.onclick = () => this.end();
        
        if (this.skipBtn) {
            this.skipBtn.style.background = "rgba(46, 204, 64, 0.2)";
            this.skipBtn.style.border = "2px solid #2ecc40";
            this.skipBtn.style.color = "#2ecc40";
            this.skipBtn.style.fontWeight = "bold";
            this.skipBtn.onclick = (e) => { e.stopPropagation(); this.end(); };
        }

        if (this.nextBtn) {
            this.nextBtn.onclick = (e) => { e.stopPropagation(); this.end(); };
        }

        this.preloadAll();

        window.addEventListener('keydown', (e) => {
            if (this.isActive) {
                if (e.key === 'Escape') this.end();
                if (e.key === 'Enter') {
                    if (this.nextBtn && this.nextBtn.style.display !== 'none') {
                        this.end();
                    }
                }
            }
        });
        
        console.log('CutsceneSystem: Inicializado');
    },

    async preloadAll() {
        console.log('CutsceneSystem: Iniciando pre-loading de vídeos...');
        
        const mapMale = {
            'inicio_male': 'cutscenes personagem masculino/personagem masculino  cena 1.mp4',
            'especial_male': 'cutscenes personagem masculino/Modo turbo.mp4',
            'gameover_male': 'cutscenes personagem masculino/Game over.mp4',
            'novafase_male': 'cutscenes personagem masculino/Nova fase.mp4',
            'ranking_male': 'cutscenes personagem masculino/Placar de lideres.mp4'
        };
        
        const mapFemale = {
            'inicio_female': 'cutscenes personagem feminina/inicio fem.mp4',
            'especial_female': 'cutscenes personagem feminina/modo turbo.mp4',
            'gameover_female': 'cutscenes personagem feminina/gameover.mp4',
            'novafase_female': 'cutscenes personagem feminina/nova fase.mp4',
            'ranking_female': 'cutscenes personagem feminina/placar.mp4'
        };

        const allPaths = { ...mapMale, ...mapFemale };

        for (const [key, path] of Object.entries(allPaths)) {
            try {
                const encodedPath = encodeURI(path);
                const response = await fetch(encodedPath);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                this.preloadedVideos[key] = blobUrl;
                console.log(`CutsceneSystem: Vídeo pre-carregado: ${key}`);
            } catch (error) {
                console.warn(`CutsceneSystem: Erro ao pre-carregar ${key}:`, error);
            }
        }
    },

    getGender() {
        // DEBUG: Log do valor atual
        let rawValue = null;
        
        // Tenta obter do localStorage (onde o jogo salva)
        try {
            const saveData = localStorage.getItem('drogaria_runner_v5_save');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                rawValue = parsed.selectedChar || null;
            }
        } catch (e) {
            console.warn('CutsceneSystem: Erro ao ler localStorage', e);
        }
        
        // Fallback para window.game (se disponível)
        if (!rawValue && window.game && window.game.selectedChar) {
            rawValue = window.game.selectedChar;
        }
        
        // Fallback padrão
        if (!rawValue) {
            rawValue = 'male';
        }
        
        // Normaliza para 'male' ou 'female'
        let gender = 'male'; // padrão
        const lower = rawValue.toLowerCase();
        if (lower === 'female' || lower === 'feminino') {
            gender = 'female';
        } else if (lower === 'male' || lower === 'masculino') {
            gender = 'male';
        }
        
        console.log('CutsceneSystem: Gênero detectado:', { raw: rawValue, normalized: gender });
        return gender;
    },

    getPath(type) {
        const gender = this.getGender();
        const isFemale = gender === 'female';
        
        console.log('CutsceneSystem: Buscando path para tipo:', type, '| Gênero:', gender);
        
        // Mapeamento de arquivos baseado no que existe fisicamente no disco
        // Pasta: JOGO_RUNNER/videos/personagem-masculino/ e JOGO_RUNNER/cutscenes personagem feminina/
        const mapMale = {
            'inicio': 'cutscenes personagem masculino/personagem masculino  cena 1.mp4',
            'especial': 'cutscenes personagem masculino/Modo turbo.mp4',
            'gameover': 'cutscenes personagem masculino/Game over.mp4',
            'novafase': 'cutscenes personagem masculino/Nova fase.mp4',
            'ranking': 'cutscenes personagem masculino/Placar de lideres.mp4'
        };
        
        const mapFemale = {
            'inicio': 'cutscenes personagem feminina/inicio fem.mp4',
            'especial': 'cutscenes personagem feminina/modo turbo.mp4',
            'gameover': 'cutscenes personagem feminina/gameover.mp4',
            'novafase': 'cutscenes personagem feminina/nova fase.mp4',
            'ranking': 'cutscenes personagem feminina/placar.mp4'
        };

        const path = isFemale ? mapFemale[type] : mapMale[type];
        
        if (!path) {
            console.error('CutsceneSystem: Tipo não encontrado:', type);
            return 'cutscenes personagem masculino/personagem masculino  cena 1.mp4'; // Fallback
        }
        
        console.log('CutsceneSystem: Path final:', path);
        return encodeURI(path);
    },

    play(type, callback = null) {
        if (this.isActive) {
            console.log('CutsceneSystem: Bloqueado - já ativo');
            return;
        }

        // Limpa obstáculos antes de começar vídeo para evitar mortes injustas
        if (typeof window.clearObstacles === 'function') {
            window.clearObstacles();
        }

        const gender = this.getGender();
        const preloadKey = `${type}_${gender}`;
        let src = this.preloadedVideos[preloadKey];

        if (src) {
            console.log('CutsceneSystem: Usando vídeo pré-carregado (Instantâneo)');
        } else {
            console.log('CutsceneSystem: Vídeo não pré-carregado, buscando path direto');
            src = this.getPath(type);
        }

        this.isActive = true;
        this.onComplete = callback;

        if (this.nextBtn) this.nextBtn.style.display = 'none';

        console.log('CutsceneSystem: Reproduzindo cutscene:', type, '| src:', src);

        // Reset Interface com Fade e Zoom In
        this.overlay.style.display = 'flex';
        this.overlay.style.opacity = '0';
        this.video.style.transform = "scale(0.8)";
        
        setTimeout(() => { 
            this.overlay.style.opacity = '1';
            this.video.style.transform = "scale(1)";
        }, 50);

        this.video.src = src;
        this.video.load();
        
        // Inicia Diálogos
        this.startDialogue(type);

        const playPromise = this.video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                this.video.muted = true;
                this.video.play().catch(() => this.end());
            });
        }
    },

    startDialogue(type) {
        const lines = this.texts[type];
        if (!lines || !this.dialogue || !this.textElement) return;

        clearInterval(this.textInterval);
        this.dialogue.style.display = 'flex';
        this.dialogue.style.flexDirection = 'column';
        this.dialogue.style.alignItems = 'center';
        this.dialogue.style.border = "3px solid #2ecc40";
        this.dialogue.style.boxShadow = "0 0 30px rgba(46, 204, 64, 0.4)";
        this.dialogue.style.background = "rgba(0, 5, 0, 0.95)";
        
        // No início, mostramos o botão de pular/próximo de forma mais visível
        if (type === 'inicio' && this.nextBtn) {
            this.nextBtn.textContent = "PULAR E JOGAR [ENTER]";
            this.nextBtn.style.display = 'block';
        }

        let i = 0;
        const show = () => {
            if (i < lines.length) {
                this.textElement.style.opacity = '0';
                setTimeout(() => {
                    this.textElement.textContent = lines[i++];
                    this.textElement.style.opacity = '1';
                }, 200);
            } else {
                clearInterval(this.textInterval);
                if (this.nextBtn) {
                    this.nextBtn.textContent = "JOGAR AGORA [ENTER]";
                    this.nextBtn.style.display = 'block';
                }
            }
        };
        this.textElement.style.transition = "opacity 0.3s ease";
        show();
        this.textInterval = setInterval(show, 3500);
    },

    end() {
        if (!this.isActive) return;
        this.isActive = false;
        clearInterval(this.textInterval);

        this.overlay.style.opacity = '0';
        this.video.style.transform = "scale(1.1)";
        
        setTimeout(() => {
            if (this.video) {
                this.video.pause();
                this.video.src = "";
            }
            this.overlay.style.display = 'none';
            if (this.dialogue) this.dialogue.style.display = 'none';

            console.log('CutsceneSystem: Finalizado');

            if (this.onComplete) {
                const cb = this.onComplete;
                this.onComplete = null;
                cb();
            }
        }, 300);
    }
};

document.addEventListener('DOMContentLoaded', () => CutsceneSystem.init());

// Funções de Gatilho para o index.html
function startIntro() { 
    console.log('CutsceneSystem: startIntro() chamado');
    CutsceneSystem.play('inicio', () => { if(window.resetGame) resetGame(); }); 
}
function onPlayerDeath() { 
    console.log('CutsceneSystem: onPlayerDeath() chamado');
    CutsceneSystem.play('gameover', () => { if(window.finishGameOver) finishGameOver(); }); 
}
function onSpecialActivated() { 
    console.log('CutsceneSystem: onSpecialActivated() chamado');
    CutsceneSystem.play('especial', () => { if(window.activateSpecialInGame) activateSpecialInGame(); }); 
}
function onNewStageUnlocked() {
    console.log('CutsceneSystem: onNewStageUnlocked() chamado');
    CutsceneSystem.play('novafase');
}
function openRanking() {
    console.log('CutsceneSystem: openRanking() chamado');
    CutsceneSystem.play('ranking');
}

// Função de debug para testar manualmente
window.testCutscene = function(type) {
    console.log('=== DEBUG CUTSCENE ===');
    console.log('game.selectedChar:', window.game?.selectedChar);
    CutsceneSystem.play(type);
};
