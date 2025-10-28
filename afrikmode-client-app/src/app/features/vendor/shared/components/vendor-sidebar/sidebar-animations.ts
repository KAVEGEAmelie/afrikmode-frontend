import { 
    trigger, 
    state, 
    style, 
    transition, 
    animate,
    query,
    stagger
  } from '@angular/animations';
  
  export const sidebarAnimations = {
    // Animation pour le menu déroulant
    slideDown: trigger('slideDown', [
      transition(':enter', [
        style({
          height: 0,
          opacity: 0,
          overflow: 'hidden'
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          height: '*',
          opacity: 1
        }))
      ]),
      transition(':leave', [
        style({
          height: '*',
          opacity: 1,
          overflow: 'hidden'
        }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          height: 0,
          opacity: 0
        }))
      ])
    ]),
  
    // Animation pour les éléments de liste
    listAnimation: trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ 
            opacity: 0, 
            transform: 'translateX(-20px)' 
          }),
          stagger(50, [
            animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
              style({ 
                opacity: 1, 
                transform: 'translateX(0)' 
              })
            )
          ])
        ], { optional: true })
      ])
    ]),
  
    // Animation pour le badge
    badgePulse: trigger('badgePulse', [
      state('default', style({ transform: 'scale(1)' })),
      state('pulse', style({ transform: 'scale(1.2)' })),
      transition('default <=> pulse', animate('200ms ease-in-out'))
    ]),
  
    // Animation pour l'icône active
    iconRotate: trigger('iconRotate', [
      state('default', style({ transform: 'rotate(0deg)' })),
      state('rotated', style({ transform: 'rotate(360deg)' })),
      transition('default => rotated', animate('500ms ease-in-out'))
    ])
  };
  
  // Pour utiliser ces animations dans le composant:
  // 1. Importer dans le composant:
  //    import { sidebarAnimations } from './sidebar-animations';
  // 
  // 2. Ajouter dans le décorateur @Component:
  //    animations: [
  //      sidebarAnimations.slideDown,
  //      sidebarAnimations.listAnimation,
  //      sidebarAnimations.badgePulse,
  //      sidebarAnimations.iconRotate
  //    ]
  //
  // 3. Utiliser dans le template:
  //    <div class="submenu" [@slideDown]>...</div>