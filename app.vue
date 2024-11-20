<script setup lang="ts">
import JSConfetti from "js-confetti";
const jsConfetti = ref<JSConfetti>();

const pontuacao = ref(0);
const words = await useFetch("/api/words");

const suporte = ref<boolean>();
const comecou = ref(false);
const tempoDeJogo = ref(0);
const palavra = ref<string>();

const recognition = ref();
const reconhecendo = ref(false);
const palavraErrada = ref<string>();

const acertos = ref<string[]>([]);

watch(reconhecendo, (value) => {
	if (value) palavraErrada.value = undefined;
});

function comecar() {
	comecou.value = true;
	palavra.value = palavraAleatoria();
	setInterval(() => tempoDeJogo.value++, 1000);
}

function palavraAleatoria() {
	const index = Math.floor(Math.random() * (words.data.value?.length ?? 0));
	return words.data.value?.splice(index, 1)[0];
}

function verificaPermissoes() {
	if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return false;

	const speechAPI = (window as any).webkitSpeechRecognition ?? (window as any).SpeechRecognition;
	recognition.value = new speechAPI();

	recognition.value!.continuous = false;
	recognition.value!.lang = "en-US";

	recognition.value!.onstart = () => {
		reconhecendo.value = true;
	};

	recognition.value!.onend = () => {
		reconhecendo.value = false;
	};

	recognition.value!.onresult = (event: any) => {
		if (!palavra.value) return;

		const result = String(event.results[0][0].transcript).replace(/ /gi, "");
		if (result.toLowerCase().startsWith(palavra.value.toLowerCase())) {
			pontuacao.value++;
			acertos.value.push(palavra.value);
			palavra.value = palavraAleatoria();

			(document.getElementById("correct") as HTMLAudioElement)?.play();
			jsConfetti.value!.addConfetti({
				confettiNumber: 30,
			});
		} else {
			palavraErrada.value = result;
		}
	};

	return true;
}

function ouvir() {
	if (reconhecendo.value) {
		recognition.value!.stop();
		return;
	}

	recognition.value!.start();
}

function pular() {
	palavra.value = palavraAleatoria();
}

function share() {
	navigator.share({
		title: "Aprenda inglês com Speech Recognition API",
		text: `Estou jogando o jogo de pronúncia em inglês e já acertei ${pontuacao.value} palavras!`,
		url: window.location.href,
	});
}

onMounted(() => {
	jsConfetti.value = new JSConfetti();
	suporte.value = verificaPermissoes();
});

useSeoMeta({
	title: "Aprenda inglês com Speech Recognition API",
	ogTitle: "Aprenda inglês com Speech Recognition API",
	description: "Com a ajuda da Speech Recognition API, você pode aprender inglês de forma mais eficiente e divertida.",
	ogDescription: "Com a ajuda da Speech Recognition API, você pode aprender inglês de forma mais eficiente e divertida.",
});
</script>

<template>
	<main class="flex flex-col w-screen h-screen">
		<!-- Som de acerto (correct.wav) -->
		<audio id="correct" src="/correct.wav"></audio>

		<Navbar />

		<UContainer class="flex items-center justify-center w-full h-full overflow-y-auto">
			<UCard v-if="suporte" class="w-full">
				<div id="card-header" class="flex flex-row justify-between">
					<span>Pontuação: {{ pontuacao }}</span>
					<span>Tempo de Jogo: {{ converterSegundosParaTempo(tempoDeJogo) }}</span>
				</div>

				<div id="card-body" class="my-10">
					<div v-if="!comecou">
						<p>Com a ajuda da Speech Recognition API, você pode aprender inglês de forma mais eficiente e divertida.</p>
						<p>Vamos utilizar seu microfone para ouvir sua pronúncia e avaliar se você está falando corretamente.</p>

						<p>Você ganhará <strong>1</strong> ponto para cada palavra que você pronunciar corretamente.</p>
						<p>Vamos começar?</p>
					</div>

					<div v-else>
						<UAlert
							v-if="palavraErrada"
							icon="i-heroicons-x-circle"
							color="red"
							variant="solid"
							title="Palavra incorreta"
							:description="`Eu entendi: ${palavraErrada}`"
							class="mb-10"
						/>

						<h2 class="text-4xl font-bold text-center">{{ palavra }}</h2>
					</div>
				</div>

				<div id="card-footer" class="flex flex-row justify-end">
					<UButton v-if="!comecou" @click="comecar">Começar</UButton>
					<div v-else class="flex flex-row gap-5 w-full">
						<UButton @click="share" :disabled="reconhecendo" color="blue" class="mr-auto">Compartilhar</UButton>

						<UButton @click="pular" :disabled="reconhecendo" color="amber" class="ml-auto">Pular</UButton>
						<UButton @click="ouvir">{{ reconhecendo ? "Parar" : "Responder" }}</UButton>
					</div>
				</div>
			</UCard>
			<UCard v-else-if="suporte === false">
				<div id="card-body" class="my-10">
					<p>Seu navegador não suporta a API de reconhecimento de voz.</p>
					<p>Por favor, utilize o Google Chrome ou Microsoft Edge para jogar.</p>
				</div>
			</UCard>
			<UCard v-else>
				<div id="card-body" class="my-10">
					<p>Verificando suporte...</p>
				</div>
			</UCard>
		</UContainer>
	</main>
</template>
