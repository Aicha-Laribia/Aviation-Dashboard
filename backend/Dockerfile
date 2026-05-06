# Use an official Python runtime
FROM python:3.13

# Set the working directory
WORKDIR /code

# Copy your requirements and install them
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy your whole backend app into the container
COPY . .

# Hugging Face Spaces expects apps to run on port 7860!
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]