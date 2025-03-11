export interface InternetAgentRequest{
    prompt: string;
    n_queries?: number; // default three
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

export interface SequentialInternetAgentRequest{
    prompt: string;
    n_queries?: number; // default three
    max_recursion?: number; // default 10
    service?: InternetService;
    model: Model;
}