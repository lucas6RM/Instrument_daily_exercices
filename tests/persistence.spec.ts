import { test, expect, Page } from '@playwright/test';

async function createExercise(page: Page, name: string, duration: number): Promise<void> {
  await page.locator('#exercise-name').fill(name);
  await page.locator('#exercise-duration').fill(String(duration));
  await page.getByRole('button', { name: "Ajouter l'exercice" }).click();
  await page.getByRole('status').getByText(new RegExp(name)).waitFor({ state: 'visible' });
}

test.describe('Exercise persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/routine');
    await page
      .getByRole('heading', { name: "Ma routine d'exercices" })
      .waitFor({ state: 'visible' });
    await page.evaluate(() => localStorage.clear());
    await page.goto('/routine');
    await page
      .getByRole('heading', { name: "Ma routine d'exercices" })
      .waitFor({ state: 'visible' });
  });

  test('B - exercises persist after page refresh', async ({ page }) => {
    await createExercise(page, 'Scale Hanon', 1);
    await createExercise(page, 'Arpeggios C', 1);

    await page.reload();

    await expect(
      page.getByRole('list', { name: 'Liste des exercices' }).locator('app-exercise-card'),
    ).toHaveCount(2);
  });

  test('A1 - exercises persist after navigation to dashboard via link', async ({ page }) => {
    await createExercise(page, 'Scale Hanon', 1);
    await createExercise(page, 'Arpeggios C', 1);

    await page.locator('app-navigation').getByRole('link', { name: 'Dashboard' }).click();

    await expect(
      page.getByRole('list', { name: 'Liste des exercices' }).locator('app-exercise-row'),
    ).toHaveCount(2);
  });

  test('A2 - exercises persist after navigation to dashboard via route', async ({ page }) => {
    await createExercise(page, 'Scale Hanon', 1);
    await createExercise(page, 'Arpeggios C', 1);

    await page.goto('/');

    await expect(
      page.getByRole('list', { name: 'Liste des exercices' }).locator('app-exercise-row'),
    ).toHaveCount(2);
  });

  test('C1 - exercise auto-completes after timer expiration and persists in history', async ({
    page,
  }) => {
    await page.clock.install();

    await createExercise(page, 'Timer Test', 1);

    await page.locator('app-navigation').getByRole('link', { name: 'Dashboard' }).click();

    await expect(
      page.getByRole('list', { name: 'Liste des exercices' }).locator('app-exercise-row'),
    ).toHaveCount(1);

    await page.getByRole('button', { name: 'Lancer le timer pour Timer Test' }).click();

    await page.clock.fastForward(61_000);

    await expect(
      page.getByRole('checkbox', { name: 'Marquer Timer Test comme terminé' }),
    ).toBeChecked();

    await page.locator('app-navigation').getByRole('link', { name: 'Historique' }).click();

    await expect(page.getByRole('heading', { name: 'Historique hebdomadaire' })).toBeVisible();

    const todayCard = page.getByRole('article').first();
    const completedSection = todayCard.getByRole('region', { name: 'Exercices réalisés' });
    await expect(completedSection.locator('text=Timer Test')).toBeVisible();
    await expect(completedSection.locator('text=1 min')).toBeVisible();
  });

  test('C2 - two-exercises auto-completes after timer expiration and persists in history', async ({
    page,
  }) => {
    await page.clock.install();

    await createExercise(page, 'Timer Testa', 1);
    await createExercise(page, 'Timer Testb', 2);

    await page.locator('app-navigation').getByRole('link', { name: 'Dashboard' }).click();

    await expect(
      page.getByRole('list', { name: 'Liste des exercices' }).locator('app-exercise-row'),
    ).toHaveCount(2);

    await page.getByRole('button', { name: 'Lancer le timer pour Timer Testa' }).click();

    await page.clock.fastForward(61_000);

    await expect(
      page.getByRole('checkbox', { name: 'Marquer Timer Testa comme terminé' }),
    ).toBeChecked();

    await page.getByRole('button', { name: 'Lancer le timer pour Timer Testb' }).click();

    await page.clock.fastForward(121_000);

    await expect(
      page.getByRole('checkbox', { name: 'Marquer Timer Testb comme terminé' }),
    ).toBeChecked();

    await page.locator('app-navigation').getByRole('link', { name: 'Historique' }).click();

    await expect(page.getByRole('heading', { name: 'Historique hebdomadaire' })).toBeVisible();

    const todayCard = page.getByRole('article').first();
    const completedSection = todayCard.getByRole('region', { name: 'Exercices réalisés' });
    await expect(completedSection.locator('text=Timer Testa')).toBeVisible();
    await expect(completedSection.locator('text=1 min')).toBeVisible();
    await expect(completedSection.locator('text=Timer Testb')).toBeVisible();
    await expect(completedSection.locator('text=2 min')).toBeVisible();
  });
});
