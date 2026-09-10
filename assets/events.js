/*
 * ----------------------------------------------------------------
 * events.js — primer modulo JavaScript del tema Kinelia
 * ----------------------------------------------------------------
 *
 * Bus de eventos DOM (SHELL-03, D-05). Es un wrapper FINO sobre CustomEvent y
 * document: no mantiene registro propio de subscribers, ni cola, ni promesas.
 * Un consumidor que usa Kinelia.events.on(...) y uno que usa
 * document.addEventListener(...) reciben el MISMO evento, porque es el mismo
 * evento. El wrapper solo agrega: nombres tipados contra un contrato (evita
 * typos), handles de desuscripcion, y un punto unico para depurar.
 *
 * Contrato de nombres y de la forma del `detail`: ETAPA-2-SEAMS.md (SHELL-04).
 * Regla de payload: el `detail` lleva identificadores y montos en centavos; nunca
 * email, nombre completo, direccion postal ni telefono.
 *
 * NO se expone un segundo global de analitica ni un shim de seguimiento paralelo
 * (D-02): el bus DOM es la unica API de eventos interna del tema.
 *
 * Nadie emite eventos en la Fase 3 (D-07). El modulo y el contrato se entregan;
 * los emisores llegan en las Fases 5 y 6. Se prueba con Kinelia.events.emit(...)
 * desde la consola.
 *
 * IIFE clasico, no ESM: Skeleton no tiene import map ni bundler y adoptarlo esta
 * fuera de alcance. Cargado con <script defer> desde layout/theme.liquid.
 *
 * Convencion de nombres inspirada en el patron de Shopify Horizon
 * (namespace:verbo-en-pasado); no se copio codigo — ver OVERRIDES.md.
 */
(function () {
  "use strict";

  // Los cinco nombres publicados. Se congelan al commitear este plan: las Fases 5
  // y 6 se suscriben, Etapa 2 los reenvia, ETAPA-2-SEAMS.md los transcribe.
  var NAMES = [
    "variant:changed",
    "product:added",
    "cart:updated",
    "cart:loading",
    "cart:error",
  ];

  function emit(name, detail) {
    if (NAMES.indexOf(name) === -1) {
      console.warn("[Kinelia.events] nombre fuera del contrato:", name);
    }
    document.dispatchEvent(
      new CustomEvent(name, { detail: detail || {}, bubbles: true })
    );
  }

  function on(name, callback) {
    document.addEventListener(name, callback);
    return { name: name, callback: callback };
  }

  function off(handle) {
    if (handle && handle.name) {
      document.removeEventListener(handle.name, handle.callback);
    }
  }

  window.Kinelia = window.Kinelia || {};
  window.Kinelia.events = { emit: emit, on: on, off: off, NAMES: NAMES };
})();
