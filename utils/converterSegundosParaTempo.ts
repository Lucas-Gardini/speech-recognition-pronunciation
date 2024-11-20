export function converterSegundosParaTempo(segundos: number): string {
	const minutos = Math.floor((segundos % 3600) / 60);
	const segundosRestantes = segundos % 60;

	return `${minutos.toString().padStart(2, "0")}:${segundosRestantes.toString().padStart(2, "0")}`;
}
