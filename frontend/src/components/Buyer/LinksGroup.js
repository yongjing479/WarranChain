import React, { useState } from "react";
import { Group, Box, Collapse, UnstyledButton} from "@mantine/core";
// Temporarily comment out the problematic import
// import { IconChevronRight } from "@tabler/icons-react";

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  link,
  activeTab,
  setActiveTab,
}) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : []).map((linkItem) => (
    <UnstyledButton
      key={linkItem.label}
      onClick={() => setActiveTab(linkItem.link)}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 16px 8px 32px",
        textDecoration: "none",
        color: activeTab === linkItem.link ? "#228be6" : "#495057",
        backgroundColor:
          activeTab === linkItem.link ? "#e7f5ff" : "transparent",
        borderRadius: "8px",
        marginBottom: "2px",
        fontWeight: activeTab === linkItem.link ? 600 : 400,
        transition: "all 0.2s ease",
        fontSize: "14px",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {linkItem.label}
    </UnstyledButton>
  ));

  const handleClick = () => {
    if (hasLinks) {
      setOpened((o) => !o);
    } else {
      setActiveTab(link);
    }
  };

  const isActive = hasLinks
    ? links.some((linkItem) => activeTab === linkItem.link)
    : activeTab === link;

  return (
    <Box>
      <UnstyledButton
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px 16px",
          textDecoration: "none",
          color: isActive ? "#228be6" : "#495057",
          backgroundColor: isActive ? "#e7f5ff" : "transparent",
          borderRadius: "8px",
          marginBottom: "4px",
          fontWeight: isActive ? 600 : 400,
          transition: "all 0.2s ease",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Group gap="sm">
          <Icon size={20} />
          <span
            style={{
              fontSize: "16px",
              color: "#495057", 
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {label}
          </span>
        </Group>
        {hasLinks && (
          <span
            style={{
              transform: opened ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              fontSize: "12px",
            }}
          >
            ▶
          </span>
        )}
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </Box>
  );
}
