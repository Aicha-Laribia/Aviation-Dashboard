import pickle

with open("app/ml/encoders.pkl", "rb") as f:
    encoders = pickle.load(f)

print("Airlines known:", encoders['airline'].classes_)
print("Origins known:", encoders['origin'].classes_)
print("Destinations known:", encoders['destination'].classes_)