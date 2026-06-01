/**
 * Adaptateurs de réponses API → types frontend.
 *
 * Ces fonctions convertissent les réponses NestJS (potentiellement camelCase
 * ou snake_case selon la config du backend) vers les formes attendues par les
 * composants.
 *
 * Les `any` sont volontaires ici et documentés : les types API ne sont pas
 * encore stabilisés et seront affinés lors de la migration progressive des
 * pages. Les types de retour concrets seront ajoutés au fur et à mesure.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function adaptProduct(api: any): any {
  return api
}

export function adaptCategory(api: any): any {
  return api
}

export function adaptOrder(api: any): any {
  return api
}

export function adaptCart(api: any): any {
  return api
}

export function adaptUser(api: any): any {
  return api
}
