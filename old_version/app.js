// Tournament Management System
class TournamentManager {
    constructor() {
        this.matches = {
            1: { winner: null, players: ['1-1', '1-2'], next: '5-1' },
            2: { winner: null, players: ['2-1', '2-2'], next: '5-2' },
            3: { winner: null, players: ['3-1', '3-2'], next: '6-1' },
            4: { winner: null, players: ['4-1', '4-2'], next: '6-2' },
            5: { winner: null, players: ['5-1', '5-2'], next: '7-1' },
            6: { winner: null, players: ['6-1', '6-2'], next: '7-2' },
            7: { winner: null, players: ['7-1', '7-2'], next: null }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadState();
    }

    setupEventListeners() {
        // Winner selection buttons
        document.querySelectorAll('.select-winner').forEach(button => {
            button.addEventListener('click', (e) => {
                const playerDiv = e.target.closest('.player');
                const matchDiv = e.target.closest('.match');
                const matchId = parseInt(matchDiv.dataset.match);

                this.selectWinner(matchId, playerDiv);
            });
        });

        // Reset button
        document.querySelector('.reset-btn').addEventListener('click', () => {
            this.reset();
        });

        // Save on input change
        document.querySelectorAll('input.player-name').forEach(input => {
            input.addEventListener('input', () => {
                this.saveState();
            });
        });
    }

    selectWinner(matchId, playerDiv) {
        const match = this.matches[matchId];
        const playerSlot = playerDiv.dataset.slot;
        const playerNameElement = playerDiv.querySelector('.player-name');
        const playerName = playerNameElement.tagName === 'INPUT'
            ? playerNameElement.value.trim()
            : playerNameElement.textContent.trim();

        if (!playerName) {
            alert('名前を入力してください');
            return;
        }

        // Mark this player as winner
        match.winner = playerSlot;

        // Visual feedback
        const matchDiv = playerDiv.closest('.match');
        matchDiv.querySelectorAll('.player').forEach(p => {
            p.classList.remove('winner');
            p.querySelector('.select-winner').disabled = true;
        });
        playerDiv.classList.add('winner');

        // If this is the final, show champion
        if (matchId === 7) {
            this.showChampion(playerName);
            this.saveState();
            return;
        }

        // Animate winner to next round
        this.animateWinnerToNextRound(playerDiv, playerName, match.next);

        this.saveState();
    }

    animateWinnerToNextRound(sourceElement, playerName, targetSlot) {
        const targetElement = document.querySelector(`[data-slot="${targetSlot}"]`);

        // Animation timeline
        const timeline = gsap.timeline();

        // Step 1: Pulse the winner
        timeline.to(sourceElement, {
            duration: 0.4,
            scale: 1.1,
            borderColor: '#FFD700',
            boxShadow: '0 0 30px rgba(255, 215, 0, 1)',
            ease: "power2.out"
        });

        // Step 2: Fade out with scale
        timeline.to(sourceElement, {
            duration: 0.5,
            scale: 0.8,
            opacity: 0.3,
            ease: "power2.in"
        });

        // Step 3: Update target element and animate it
        timeline.call(() => {
            // Update target element
            const targetNameElement = targetElement.querySelector('.player-name');
            targetNameElement.textContent = playerName;

            // Enable button for next round
            targetElement.querySelector('.select-winner').disabled = false;

            // Set initial state for target animation
            gsap.set(targetElement, {
                scale: 0.8,
                opacity: 0,
                borderColor: '#FFD700'
            });
        });

        // Step 4: Fade in target with bounce
        timeline.to(targetElement, {
            duration: 0.6,
            scale: 1,
            opacity: 1,
            ease: "back.out(2)"
        });

        // Step 5: Flash effect
        timeline.to(targetElement, {
            duration: 0.3,
            borderColor: '#FFD700',
            boxShadow: '0 0 30px rgba(255, 215, 0, 1)',
            repeat: 2,
            yoyo: true,
            onComplete: () => {
                // Reset source element
                gsap.set(sourceElement, { scale: 1, opacity: 1 });

                // Reset target to normal state
                gsap.to(targetElement, {
                    duration: 0.3,
                    borderColor: 'rgba(139, 0, 0, 0.5)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
                });

                this.saveState();
            }
        });
    }

    showChampion(playerName) {
        const winnerDisplay = document.querySelector('.winner-display');
        const championName = document.querySelector('.champion-name');

        championName.textContent = playerName;

        gsap.timeline()
            .to(winnerDisplay, {
                duration: 0.5,
                opacity: 1,
                scale: 1,
                ease: "back.out(1.7)"
            })
            .from('.trophy', {
                duration: 1,
                rotation: 360,
                scale: 0,
                ease: "elastic.out(1, 0.5)"
            }, "-=0.3")
            .from('.champion-name', {
                duration: 0.8,
                y: 50,
                opacity: 0,
                ease: "power3.out"
            }, "-=0.5");

        winnerDisplay.classList.add('show');
    }

    saveState() {
        const state = {
            matches: this.matches,
            playerNames: {}
        };

        // Save all player names
        document.querySelectorAll('.player').forEach(player => {
            const slot = player.dataset.slot;
            const nameElement = player.querySelector('.player-name');
            const name = nameElement.tagName === 'INPUT'
                ? nameElement.value
                : nameElement.textContent;

            if (name) {
                state.playerNames[slot] = name;
            }
        });

        localStorage.setItem('tournamentState', JSON.stringify(state));
    }

    loadState() {
        const savedState = localStorage.getItem('tournamentState');
        if (!savedState) return;

        try {
            const state = JSON.parse(savedState);
            this.matches = state.matches;

            // Restore player names
            Object.keys(state.playerNames).forEach(slot => {
                const player = document.querySelector(`[data-slot="${slot}"]`);
                if (player) {
                    const nameElement = player.querySelector('.player-name');
                    const name = state.playerNames[slot];

                    if (nameElement.tagName === 'INPUT') {
                        nameElement.value = name;
                    } else {
                        nameElement.textContent = name;
                    }
                }
            });

            // Restore winner states
            Object.keys(this.matches).forEach(matchId => {
                const match = this.matches[matchId];
                if (match.winner) {
                    const matchDiv = document.querySelector(`[data-match="${matchId}"]`);
                    const winnerPlayer = document.querySelector(`[data-slot="${match.winner}"]`);

                    if (winnerPlayer) {
                        winnerPlayer.classList.add('winner');
                        matchDiv.querySelectorAll('.select-winner').forEach(btn => {
                            btn.disabled = true;
                        });

                        // Enable next round if not final
                        if (match.next) {
                            const nextPlayer = document.querySelector(`[data-slot="${match.next}"]`);
                            if (nextPlayer) {
                                nextPlayer.querySelector('.select-winner').disabled = false;
                            }
                        }
                    }
                }
            });

            // Show champion if final is complete
            const finalMatch = this.matches[7];
            if (finalMatch.winner) {
                const championName = document.querySelector(`[data-slot="${finalMatch.winner}"] .player-name`).textContent;
                document.querySelector('.champion-name').textContent = championName;
                document.querySelector('.winner-display').classList.add('show');
                document.querySelector('.winner-display').style.opacity = 1;
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    reset() {
        if (!confirm('トーナメントをリセットしますか？')) {
            return;
        }

        // Reset matches
        Object.keys(this.matches).forEach(matchId => {
            this.matches[matchId].winner = null;
        });

        // Reset all players
        document.querySelectorAll('.player').forEach(player => {
            player.classList.remove('winner');
            const nameElement = player.querySelector('.player-name');

            if (nameElement.tagName === 'INPUT') {
                nameElement.value = '';
            } else {
                nameElement.textContent = '';
            }

            const button = player.querySelector('.select-winner');
            // Only enable first round buttons
            const matchDiv = player.closest('.match');
            const round = parseInt(matchDiv.dataset.round);
            button.disabled = round !== 1;
        });

        // Hide champion display
        const winnerDisplay = document.querySelector('.winner-display');
        winnerDisplay.classList.remove('show');
        winnerDisplay.style.opacity = 0;
        document.querySelector('.champion-name').textContent = '';

        // Clear storage
        localStorage.removeItem('tournamentState');

        // Add reset animation
        gsap.from('.tournament-bracket', {
            duration: 0.5,
            opacity: 0,
            scale: 0.95,
            ease: "power2.out"
        });
    }
}

// Initialize tournament when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const tournament = new TournamentManager();

    // Initial animation
    gsap.from('header', {
        duration: 1,
        y: -50,
        opacity: 0,
        ease: "power3.out"
    });

    gsap.from('.bracket-column', {
        duration: 1,
        opacity: 0,
        stagger: 0.2,
        y: 50,
        ease: "power3.out",
        delay: 0.3
    });
});
