import openai

# Set up your OpenAI API key
openai.api_key = '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'

def get_chatgpt_response(prompt):
    try:
        # Make a request to the ChatGPT API using the v1/chat/completions endpoint
        response = openai.ChatCompletion.create(
            model="gpt-4",  # You can also use 'gpt-3.5-turbo'
            messages=[{"role": "user", "content": prompt}],  # Use the chat format
            max_tokens=100
        )

        # Get the generated text from the response
        generated_text = response['choices'][0]['message']['content'].strip()

        # Return a success message along with the generated text
        return f"Success! Generated response: {generated_text}"

    except Exception as e:
        # If an error occurs, return a failure message with the error description
        return f"Failure! An error occurred: {str(e)}"

# Example usage
prompt = "Generate a response for something that was successful."
result = get_chatgpt_response(prompt)

print(result)
