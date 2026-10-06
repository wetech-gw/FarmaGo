"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Evento `beforeinstallprompt`, que o TypeScript ainda não tipa.
 * Só o Chrome/Edge o emitem — o Safari em iOS não emite, e por isso o cartão
 * de instalação mostra as instruções manuais nesse caso.
 */
export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; outcomeType: string }>;
};

const DISMISSED_KEY = "farmago_install_dismissed";
const DISMISSED_EVENT = "farmago-install-dismissed";

/**
 * Dias que o botão fica escondido depois de dispensado.
 *
 * Sem esta validade, dispensar o botão era permanente — e não havia forma de
 * o trazer de volta, o que fazia o botão desaparecer sem explicação para quem
 * o tinha fechado uma vez a testar.
 */
const DISMISS_DAYS = 7;

/** O servidor nunca tem `window`, por isso responde sempre "não". */
const serverFalse = () => false;

// ---------------------------------------------------------------------------
// Estado externo do browser, lido com useSyncExternalStore.
//
// Ler isto no `useState(() => ...)` obrigaria a correr no servidor também (sem
// `window`) e a quebrar a hidratação. O useSyncExternalStore resolve isso: usa
// o snapshot do servidor na primeira renderização e o do browser a seguir.
// ---------------------------------------------------------------------------

function subscribeDisplayMode(callback: () => void): () => void {
  const queries = [
    window.matchMedia("(display-mode: standalone)"),
    window.matchMedia("(display-mode: fullscreen)"),
  ];

  for (const query of queries) query.addEventListener("change", callback);

  return () => {
    for (const query of queries) query.removeEventListener("change", callback);
  };
}

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    // O Safari em iOS não expõe o media query; usa esta propriedade.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getIsIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOnDesktop =
    // O iPadOS 13+ apresenta-se como Macintosh, mas com ecrã táctil.
    /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOnDesktop;
}

function subscribeNothing(): () => void {
  return () => {};
}

function subscribeDismissed(callback: () => void): () => void {
  // `storage` cobre outras separadores; o evento próprio cobre este.
  window.addEventListener("storage", callback);
  window.addEventListener(DISMISSED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DISMISSED_EVENT, callback);
  };
}

function getDismissed(): boolean {
  const raw = window.localStorage.getItem(DISMISSED_KEY);

  // Valor antigo ("1"), de antes de existir a validade.
  if (raw === "1") return true;
  if (!raw) return false;

  const since = Number(raw);
  if (!Number.isFinite(since)) return false;

  // Passou o prazo: limpar para não ficar lixo no localStorage.
  if (Date.now() - since > DISMISS_DAYS * 24 * 60 * 60 * 1000) {
    window.localStorage.removeItem(DISMISSED_KEY);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------

type InstallState = {
  /** Verdadeiro quando o navegador sabe instalar a app (Chrome/Edge/Android). */
  canPrompt: boolean;
  /** Já está instalada / a correr em janela própria. */
  installed: boolean;
  /** iPhone/iPad: a instalação é manual, através do menu de partilha. */
  needsManualSteps: boolean;
  /**
   * A instalação com um toque só é permitida em contexto seguro
   * (https:// ou localhost). Abrir a app por http://192.168.x.x — o modo
   * habitual de testar no telemóvel — conta como não seguro.
   */
  secureContext: boolean;
  /** O utilizador fechou o cartão e não quer mais vê-lo. */
  dismissed: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
};

const InstallContext = createContext<InstallState | null>(null);

export function InstallProvider({ children }: { children: ReactNode }) {
  // O evento só chega uma vez: guardámo-lo para o botão poder disparar o
  // prompt mais tarde (o Chrome obriga a chamar `prompt()` no mesmo gesto).
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);

  const installed = useSyncExternalStore(subscribeDisplayMode, getIsStandalone, serverFalse);
  const isIos = useSyncExternalStore(subscribeNothing, getIsIos, serverFalse);
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissed, serverFalse);
  const secureContext = useSyncExternalStore(
    subscribeNothing,
    () => typeof window !== "undefined" && window.isSecureContext,
    serverFalse,
  );

  useEffect(() => {
    const onBeforeInstallPrompt = (raw: Event) => {
      raw.preventDefault();
      setEvent(raw as InstallPromptEvent);
    };

    const onInstalled = () => setEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Só em produção: em desenvolvimento o service worker pode servir um
    // bundle antigo e enganar quem está a testar a instalação.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Sem service worker a app continua a funcionar e a instalar-se:
          // os critérios de instalação do Chrome não exigem service worker.
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }, [event]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    window.dispatchEvent(new Event(DISMISSED_EVENT));
  }, []);

  const value = useMemo<InstallState>(
    () => ({
      canPrompt: event !== null,
      installed,
      needsManualSteps: !installed && isIos,
      secureContext,
      dismissed,
      install,
      dismiss,
    }),
    [event, installed, isIos, secureContext, dismissed, install, dismiss],
  );

  return <InstallContext.Provider value={value}>{children}</InstallContext.Provider>;
}

export function useInstall(): InstallState {
  const value = useContext(InstallContext);
  if (!value) throw new Error("useInstall tem de ser usado dentro de <InstallProvider>");
  return value;
}