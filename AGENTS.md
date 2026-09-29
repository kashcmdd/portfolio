# Agent session: Fixes for credibility + urgency gaps (c02da06)

--- quick credibility fixes (in order) ---
1. SkillsSection literal '//' -> SKILLS & WHAT I DO (src/components/SkillsSection.tsx)
2. Live Demo badge in SelectedWorksSection: wrap with project.demoUrl (src/components/SelectedWorksSection.tsx)
3. Live Demo badge in DemoPlayer: wrap footer blink with demoUrl/codePenId/codeSandboxId (src/components/DemoPlayer.tsx)
4. Live Demo badge in ProjectModal: wrap Interactive Demo Section with demoUrl (src/components/ProjectModal.tsx)
5. currentlyBuildingData: replace with real description (src/data/portfolioData.ts)