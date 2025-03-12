// ██╗░░░██╗██╗██████╗░███████╗░█████╗░░░░░░░░██████╗░███████╗███╗░░██╗
// ██║░░░██║██║██╔══██╗██╔════╝██╔══██╗░░░░░░██╔════╝░██╔════╝████╗░██║
// ╚██╗░██╔╝██║██║░░██║█████╗░░██║░░██║█████╗██║░░██╗░█████╗░░██╔██╗██║
// ░╚████╔╝░██║██║░░██║██╔══╝░░██║░░██║╚════╝██║░░╚██╗██╔══╝░░██║╚████║
// ░░╚██╔╝░░██║██████╔╝███████╗╚█████╔╝░░░░░░╚██████╔╝███████╗██║░╚███║
// ░░░╚═╝░░░╚═╝╚═════╝░╚══════╝░╚════╝░░░░░░░░╚═════╝░╚══════╝╚═╝░░╚══╝
import Replicate from "replicate";
export async function runVideoGenAgent(request) {
    const { prompt, ak } = request;
    const replicate = new Replicate({
        auth: ak,
    });
    const input = {
        prompt: prompt,
        prompt_optimizer: true
    };
    const output = await replicate.run("minimax/video-01", { input });
    // output.output[0] is the video URL
    const videoUrl = output.output[0];
    const response = await fetch(videoUrl);
    const buffer = await response.arrayBuffer();
    return { video: Buffer.from(buffer) };
}
