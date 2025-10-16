# Dashboard Moderne - Gestion des Marchandises

## Vue d'ensemble

Ce dashboard moderne a été créé pour fournir une interface utilisateur sophistiquée et intuitive pour la gestion des marchandises et des stocks, similaire au design présenté dans l'image de référence.

## Composants

### 1. KPICardComponent
- **Fichier**: `components/kpi-card/kpi-card.component.ts`
- **Fonction**: Affiche les indicateurs clés de performance (KPI) avec icônes, valeurs et tendances
- **Fonctionnalités**:
  - Affichage de valeurs avec formatage
  - Indicateurs de tendance (hausse/baisse/stable)
  - Couleurs personnalisables
  - Animations au survol

### 2. DonutChartComponent
- **Fichier**: `components/donut-chart/donut-chart.component.ts`
- **Fonction**: Affiche des graphiques circulaires (donut) pour la répartition par catégories
- **Fonctionnalités**:
  - Graphiques SVG personnalisés
  - Légende interactive
  - Couleurs dynamiques
  - Animations de chargement

### 3. BarChartComponent
- **Fichier**: `components/bar-chart/bar-chart.component.ts`
- **Fonction**: Affiche des graphiques en barres pour les données mensuelles
- **Fonctionnalités**:
  - Barres colorées
  - Formatage des valeurs personnalisable
  - Responsive design
  - Animations au survol

### 4. TopProductsComponent
- **Fichier**: `components/top-products/top-products.component.ts`
- **Fonction**: Affiche les listes de produits (top produits, produits à réapprovisionner)
- **Fonctionnalités**:
  - Classement avec numérotation
  - Statuts visuels (disponible, stock faible, non disponible)
  - Indicateurs de tendance
  - Design responsive

### 5. DashboardFiltersComponent
- **Fichier**: `components/dashboard-filters/dashboard-filters.component.ts`
- **Fonction**: Système de filtres pour mois, catégories et références
- **Fonctionnalités**:
  - Filtres multiples sélectionnables
  - Design en chips Material
  - Événements de changement de filtres
  - Interface intuitive

## Service de Données

### DashboardDataService
- **Fichier**: `core/services/dashboard-data.service.ts`
- **Fonction**: Gestion des données du dashboard
- **Méthodes**:
  - `getKPIData()`: Récupère les données KPI
  - `getCategoryData()`: Récupère les données par catégorie
  - `getMonthlyData()`: Récupère les données mensuelles
  - `getTopProducts()`: Récupère les top produits
  - `getProductsToReplenish()`: Récupère les produits à réapprovisionner
  - `filterData()`: Filtre les données selon les critères

## Utilisation

### Intégration dans le Dashboard Principal
Le composant `ModernDashboardComponent` utilise tous les composants ci-dessus pour créer une interface complète :

```typescript
// Le dashboard principal charge automatiquement les données
ngOnInit(): void {
  this.loadDashboardData();
}
```

### Personnalisation des Couleurs
Les couleurs peuvent être personnalisées via les méthodes :
- `getCategoryColor(category: string)`: Couleurs par catégorie
- `getMonthColor(month: string)`: Couleurs par mois

### Formatage des Valeurs
Utilisez la méthode `formatCurrency(value: number)` pour formater les montants en euros.

## Design Responsive

Le dashboard s'adapte automatiquement à différentes tailles d'écran :
- **Desktop**: Grille complète avec toutes les colonnes
- **Tablet**: Adaptation des colonnes selon l'espace disponible
- **Mobile**: Affichage en une seule colonne

## Animations

- **Chargement**: Spinner avec animation de fade-in
- **Cartes**: Animations de survol et d'apparition
- **Graphiques**: Transitions fluides
- **Filtres**: Animations de sélection

## Intégration Backend

Pour connecter le dashboard à votre API backend :

1. Modifiez le `DashboardDataService` pour appeler vos endpoints
2. Adaptez les interfaces de données selon votre structure
3. Gérez les erreurs et les états de chargement
4. Implémentez la logique de filtrage côté serveur

## Exemple d'utilisation

```typescript
// Dans votre composant
constructor(private dashboardDataService: DashboardDataService) {}

// Charger les données
this.dashboardDataService.getKPIData().subscribe(data => {
  // Traiter les données
});

// Filtrer les données
this.dashboardDataService.filterData(filters).subscribe(data => {
  // Mettre à jour l'affichage
});
```

## Personnalisation

### Ajouter de nouveaux KPI
1. Étendez l'interface `KPIData`
2. Ajoutez les données dans `kpiData`
3. Personnalisez l'affichage dans le template

### Ajouter de nouveaux graphiques
1. Créez un nouveau composant de graphique
2. Intégrez-le dans le template du dashboard
3. Connectez-le au service de données

### Modifier les couleurs
1. Mettez à jour les méthodes `getCategoryColor()` et `getMonthColor()`
2. Ajustez les variables CSS dans les fichiers SCSS
3. Personnalisez les couleurs des composants individuels

## Support

Pour toute question ou personnalisation, consultez :
- La documentation Angular Material
- Les fichiers de styles SCSS pour le design
- Les interfaces TypeScript pour la structure des données
















