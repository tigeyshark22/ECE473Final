import openai
import os

key = open("openai_key", "r").read()
os.environ["OPENAI_API_KEY"] = key
client = openai.OpenAI()

gpt_assistant_prompt = "You will write Solidity smart contract code that implements the series of written, plain English directions that I will give you. I will only be using the Sepolia test network on the Ethereum blockchain. I will only ask you to implement one function or part of a function at a time. Return ONE entire block of Solidity code, followed by a plain English explanation of what the code does. For debugging purposes, make all class variables public and never make them private."
gpt_user_prompt = open("prompt", "r").read()
gpt_prompt = gpt_assistant_prompt, gpt_user_prompt

message=[{"role": "system", "content": gpt_assistant_prompt}, {"role": "user", "content": gpt_user_prompt}]
temperature=1
max_tokens=1000
frequency_penalty=0.0

def respond(message):
    return client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages = message,
        temperature=temperature,
        max_tokens=max_tokens,
        frequency_penalty=frequency_penalty
    )

generated_text = respond(message).choices[0].message.content
message.append({"role": "assistant", "content": generated_text})
user_prompt = input("Self eval? ")
if user_prompt.lower() == "yes" or user_prompt.lower() == "y":
    gpt_user_prompt_2 = "Looking back at the code you just wrote, check for any potential errors that you have made and fix them."
    message.append({"role": "user", "content": gpt_user_prompt_2})
    gen_text_2 = respond(message).choices[0].message.content
    print(gen_text_2)
else:
    print(generated_text)