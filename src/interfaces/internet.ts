export interface InternetAgentRequest{
    prompt: string;
    n_queries?: number; // default three
    ak?: number;
    service?: InternetService;
    model: Model;
}

export interface Model{
    name: string;
    base_url: string;
    ak: string;
}

export interface InternetService{
    name: 'tavily' | 'jina' | 'brave' | 'exa';
    ak: string;
}