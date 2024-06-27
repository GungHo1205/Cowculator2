import { Flex, Group, NumberInput, Select, Switch } from "@mantine/core";
import { ApiData } from "../services/ApiService";
import { ActionFunction } from "../models/Client";
import { useEffect, useState } from "react";
import CombatTable from "./CombatTable";
import { CombatData, SaveDataObject } from "../helpers/Types";

interface Props {
  data: ApiData;
  loadedSaveData: SaveDataObject;
  onCombatSkillChange: (type: string, bonuses: CombatData) => void;
}

export default function Combat({
  data,
  loadedSaveData,
  onCombatSkillChange,
}: Props) {
  const [action, setAction] = useState<string | null>(null);
  const [kph, setKph] = useState<number>(0);
  const [withLuckyCoffee, setWithLuckyCoffee] = useState<boolean>(false);
  const [combatBuffLevel, setCombatBuffLevel] = useState<number | "">(0);
  const [partyAmount, setPartyAmount] = useState<number | "">(1);
  const actions = Object.values(data.actionDetails)
    .filter((x) => x.function === ActionFunction.Combat)
    .sort((a, b) => {
      if (a.sortIndex < b.sortIndex) return -1;
      if (a.sortIndex > b.sortIndex) return 1;
      return 0;
    })
    .map((x) => ({
      value: x.hrid,
      label: x.name,
    }));
  useEffect(() => {
    console.log(loadedSaveData.skills.combatLoot.data.zone); // toggle if new people are allowed
    loadedSaveData.skills.combatLoot.data.zone === ""
      ? setAction("/actions/combat/fly")
      : setAction(loadedSaveData.skills.combatLoot.data.zone);
    // setAction(loadedSaveData.skills.combatLoot.data.zone);
    setKph(loadedSaveData.skills.combatLoot.data.encountersHr);
  }, []);
  useEffect(() => {
    onCombatSkillChange("loot", {
      data: {
        zone: action || "",
        encountersHr: kph,
      },
    });
  }, [action, kph]);
  const checkActionIfDungeon = (action: string | null) => {
    if (action === null) {
      return false;
    } else return data.actionDetails[action].combatZoneInfo?.isDungeon;
  };
  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Group>
        <Select
          searchable
          clearable
          withAsterisk
          size="lg"
          value={action}
          onChange={setAction}
          data={actions}
          label="Select a zone"
          placeholder="Pick one"
          defaultValue={"/actions/combat/fly"}
        />
        <NumberInput
          value={kph}
          onChange={(val) => setKph(val || 0)}
          label={checkActionIfDungeon(action) ? "Chests" : "Encounters/hr"}
          withAsterisk
          hideControls
          min={0}
          precision={2}
        />
        {checkActionIfDungeon(action) ? (
          <></>
        ) : (
          <NumberInput
            value={combatBuffLevel}
            onChange={setCombatBuffLevel}
            label="Combat Buff Level"
            withAsterisk
            hideControls
            min={0}
            max={20}
          />
        )}
        {checkActionIfDungeon(action) ? (
          <></>
        ) : (
          <NumberInput
            value={partyAmount}
            onChange={setPartyAmount}
            label="Party amount"
            withAsterisk
            hideControls
            min={1}
            max={3}
          />
        )}
        {checkActionIfDungeon(action) ? (
          <></>
        ) : (
          <Switch
            onLabel="WITH Lucky Coffee"
            offLabel="NO Lucky Coffee"
            size="xl"
            checked={withLuckyCoffee}
            onChange={(event) =>
              setWithLuckyCoffee(event.currentTarget.checked)
            }
          />
        )}
      </Group>
      {action && kph > 0 && (
        <CombatTable
          action={action}
          data={data}
          kph={kph}
          withLuckyCoffee={withLuckyCoffee}
          combatBuffLevel={Math.max(0, Math.min(20, Number(combatBuffLevel)))}
          partyAmount={Math.max(1, Math.min(3, Number(partyAmount)))}
          dungeon={checkActionIfDungeon(action)!}
        />
      )}
    </Flex>
  );
}
