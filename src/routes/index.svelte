<script lang="ts">
  import { map } from "lodash-es";

  import randomNumber from "../functions/randomNumber";

  let form: HTMLDivElement = undefined as unknown as HTMLDivElement;
  let game: HTMLDivElement = undefined as unknown as HTMLDivElement;

  function enoughActions() {
    const enough = turn.actions >= 1;
    if (enough) turn.actions--;
    return enough;
  }

  function enoughCash(amount: number) {
    const enough = country.stats.money >= amount;
    if (enough) country.stats.money -= amount;
    return enough;
  }

  function enough(amount: number) {
    if (country.stats.money >= amount && turn.actions >= 1) {
      enoughActions();
      enoughCash(amount);

      return true;
    }
    return false;
  }

  function happy() {
    if (!enough(500)) return;
    country.stats.happiness += 5;
  }

  function onForm(event: Event) {
    form.style.display = "none";
    game.className = "";
  }

  function nextTurn() {
    if (turn.number === 25) return; // TODO: add end function
    turn.number++;
    turn.actions = 2;

    const stats = country.stats;
    // ECONOMY
    let total = 0;

    // tax
    total += stats.population * (0.01 * stats.happiness);

    // business
    businesses.map((v) => (total += v.money));

    country.stats.money += Math.round(total);

    // POPULATION
    country.stats.population += Math.round(stats.happiness * 1.5);
    if (country.stats.population > stats.territory * 500) {
      country.stats.population = stats.territory * 500;
    }
  }

  function expand() {
    if (!enough(1000)) return;
    country.stats.territory++;
  }

  let options = {
    religions: ["Christianity", "Islam", "Hinduism", "Buddhism", "Judaism"],
    goverments: ["Democracy", "Theocracy", "Monarchy", "Dictatorship", "Oligarchy", "Anarchy"]
  };

  let country = {
    stats: {
      money: 1000,
      happiness: 60,
      population: 300,
      territory: 1
    },

    traits: {
      name: "",
      religion: "",
      goverment: ""
    }
  };

  let turn = {
    number: 1,
    actions: 2
  };

  let businesses: { name: string; money: number; start: number }[] = [
    { name: "Air Factory", money: 100, start: 100 }
  ];

  function totalBusinesses() {
    return businesses.map((v) => v.money).reduce((acc, cur) => acc + cur);
  }
</script>

<div class="start" bind:this={form}>
  <form on:submit|preventDefault={onForm}>
    <input type="text" placeholder="Name" bind:value={country.traits.name} required />

    <select bind:value={country.traits.religion} required>
      <option value="" disabled selected>Religion</option>
      {#each options.religions as religion}
        <option value={religion}>
          {religion}
        </option>
      {/each}
    </select>

    <select bind:value={country.traits.goverment} required>
      <option value="" disabled selected>Goverment</option>
      {#each options.goverments as goverment}
        <option value={goverment}>
          {goverment}
        </option>
      {/each}
    </select>

    <button class="border border-black p-2">Create country!</button>
  </form>
</div>

<div class="hidden" bind:this={game}>
  <div class="text-center">
    <h1 class="text-center text-6xl font-bold">{country.traits.name}</h1>
    <br />
    <h3 class="text-center text-lg font-bold">
      You are {country.traits.goverment === "Anarchy" ? "an" : "a"}
      {country.traits.goverment} that believes in {country.traits.religion}.
    </h3>
  </div>

  <div class="text-center">
    <h1 class="text-center">Turn {turn.number}</h1>
    <button on:click={nextTurn} class="text-center p-2 text-lg border m-4">Next Turn</button>
    <br />
    <h1 class="text-xl">Actions: {turn.actions}</h1>
  </div>

  <div class="float-left border p-4">
    <p>Money: ${country.stats.money}.</p>
    <p>Population: {country.stats.population} people.</p>
    <p>Happiness: {country.stats.happiness}%.</p>
    <button on:click={happy} class="text-center p-2 text-lg border m-4">Buy Happiness (500)</button>
    <p>
      Squares: {country.stats.territory}
      {country.stats.territory !== 1 ? "squares" : "square"}.
    </p>
    <button on:click={expand} class="text-center p-2 text-lg border m-4">Expand (1000)</button>
  </div>
</div>

<div class="hidden">
  <h1 class="text-2xl">SCORE:</h1>
  <h2 class="text-xl">Population: {country.stats.population * 0.5}</h2>
  <h2 class="text-xl">Territory: {country.stats.territory * 100}</h2>
  <h2 class="text-xl">Economy: {0.25 * country.stats.money + 0.5 * totalBusinesses()}</h2>
</div>
