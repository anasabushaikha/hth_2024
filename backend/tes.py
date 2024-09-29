import openai
import sys

# Set up your OpenAI API key
openai.api_key = "sk-UHlUVdoNU9zPv4QxtEbNnt11vF0dQ97hEsJY_dkRTnT3BlbkFJ1cfU9682oaC5SPkHZRT6FsHSA8dhOomA9TSodjaTUA"

def ask_gpt(question):
    try:
        # Send request to OpenAI GPT-4
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": question},
            ],
            max_tokens=150  # Limit the response length
        )

        # Extract and return the GPT-4 answer
        return response['choices'][0]['message']['content']

    except Exception as e:
        return f"Error: {str(e)}"

def main():
    print("Welcome to the GPT-4 CLI Question-Answer interface!")
    print("Type 'exit' to end the conversation.\n")

    while True:
        # Prompt the user for input
        question = input("You: ")

        # If the user types 'exit', end the program
        if question.lower() == 'exit':
            print("Goodbye!")
            sys.exit()

        # Get and print the response from GPT-4
        answer = ask_gpt(question)
        print(f"GPT-4: {answer}\n")

if __name__ == "__main__":
    main()
